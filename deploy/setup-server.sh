#!/bin/bash
# Script de instalación automática para Ubuntu Server 24.04
# Uso: chmod +x setup-server.sh && ./setup-server.sh

set -e

echo "========================================="
echo "Instalador BrainHub - Ubuntu Server 24.04"
echo "========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Función para imprimir mensajes
log() {
    echo -e "${GREEN}[*]${NC} $1"
}

error() {
    echo -e "${RED}[!]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Validar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
   error "Este script debe ejecutarse como root (use sudo)"
   exit 1
fi

# Paso 1: Actualizar sistema
log "Actualizando sistema..."
apt update && apt upgrade -y

# Paso 2: Instalar dependencias
log "Instalando dependencias..."
apt install -y \
    python3.12 \
    python3.12-venv \
    python3.12-dev \
    postgresql \
    postgresql-contrib \
    nginx \
    certbot \
    python3-certbot-nginx \
    git \
    build-essential \
    curl \
    wget

# Paso 3: Crear usuario y directorios
log "Creando usuario y directorios..."
useradd -m -s /bin/bash brainhub 2>/dev/null || warning "Usuario brainhub ya existe"
mkdir -p /var/www/brainhub/{backend,frontend,logs}
chown -R brainhub:brainhub /var/www/brainhub
chmod -R 755 /var/www/brainhub

# Paso 4: Iniciar PostgreSQL
log "Iniciando PostgreSQL..."
systemctl enable postgresql
systemctl start postgresql

# Paso 5: Crear usuario y BD en PostgreSQL
log "Configurando PostgreSQL..."
sudo -u postgres psql << EOF
SELECT 1 FROM pg_user WHERE usename = 'brainhub_user' LIMIT 1;
EOF

# Crear usuario y BD si no existen
sudo -u postgres psql << EOF || log "BD ya existe"
CREATE USER brainhub_user WITH PASSWORD 'brainhub_password';
CREATE DATABASE brainhub_db OWNER brainhub_user;
ALTER ROLE brainhub_user SET client_encoding TO 'utf8';
ALTER ROLE brainhub_user SET default_transaction_isolation TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE brainhub_db TO brainhub_user;
EOF

# Paso 6: Configurar backend Python
log "Configurando backend Python..."
cd /var/www/brainhub/backend

# Crear venv
python3.12 -m venv venv
source venv/bin/activate

# Actualizar pip
pip install --upgrade pip setuptools wheel

# Instalar dependencias (asumiendo que requirements.txt está disponible)
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    log "Dependencias de Python instaladas"
else
    warning "requirements.txt no encontrado"
fi

# Crear .env si no existe
if [ ! -f ".env" ]; then
    cp .env.example .env 2>/dev/null || log ".env.example no encontrado, creando .env vacío"
    log "Archivo .env creado. Por favor, editalo con tus credenciales:"
    log "  nano /var/www/brainhub/backend/.env"
fi

deactivate

# Paso 7: Configurar systemd service
log "Configurando systemd service..."
cp deploy/brainhub.service /etc/systemd/system/ 2>/dev/null || log "brainhub.service no encontrado"
systemctl daemon-reload
systemctl enable brainhub 2>/dev/null || warning "No se pudo habilitar servicio brainhub"

# Paso 8: Configurar Nginx
log "Configurando Nginx..."
cp deploy/nginx.conf /etc/nginx/sites-available/brainhub 2>/dev/null || log "nginx.conf no encontrado"
ln -sf /etc/nginx/sites-available/brainhub /etc/nginx/sites-enabled/brainhub 2>/dev/null || warning "No se pudo crear enlace simbólico"

# Deshabilitar configuración por defecto
rm -f /etc/nginx/sites-enabled/default

# Validar y recargar Nginx
if nginx -t; then
    systemctl reload nginx
    log "Nginx configurado y recargado"
else
    error "Error en configuración de Nginx"
fi

# Paso 9: Configurar firewall
log "Configurando firewall (UFW)..."
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw default deny incoming
ufw default allow outgoing

# Paso 10: Crear directorios de logs y backups
log "Creando directorios de soporte..."
mkdir -p /var/log/brainhub
mkdir -p /backups/brainhub
chown -R brainhub:brainhub /var/log/brainhub
chown -R root:root /backups/brainhub

# Paso 11: Instalar y configurar script de backup
log "Instalando script de backup..."
tee /usr/local/bin/backup-brainhub.sh > /dev/null << 'BACKUP_EOF'
#!/bin/bash
BACKUP_DIR="/backups/brainhub"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
sudo -u postgres pg_dump brainhub_db | gzip > $BACKUP_DIR/brainhub_db_$DATE.sql.gz
tar -czf $BACKUP_DIR/brainhub_app_$DATE.tar.gz /var/www/brainhub/
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
echo "Backup completado: $DATE"
BACKUP_EOF

chmod +x /usr/local/bin/backup-brainhub.sh

# Configurar cron para backups
tee /etc/cron.d/brainhub-backup > /dev/null << 'CRON_EOF'
0 2 * * * root /usr/local/bin/backup-brainhub.sh
CRON_EOF

# Resumen final
echo ""
echo "========================================="
echo "¡Instalación completada!"
echo "========================================="
echo ""
echo -e "${YELLOW}Pasos siguientes:${NC}"
echo ""
echo "1. Configurar variables de entorno:"
echo "   sudo nano /var/www/brainhub/backend/.env"
echo ""
echo "2. Restaurar base de datos (si tienes un dump):"
echo "   sudo -u postgres psql brainhub_db < schema_v3_brainhub.sql"
echo ""
echo "3. Desplegar frontend:"
echo "   cd /var/www/brainhub/frontend"
echo "   npm install && npm run build"
echo "   sudo cp -r dist/* ."
echo ""
echo "4. Iniciar servicio:"
echo "   sudo systemctl start brainhub"
echo "   sudo systemctl status brainhub"
echo ""
echo "5. Configurar SSL (requiere dominio):"
echo "   sudo certbot certonly --nginx -d tu-dominio.com"
echo ""
echo "6. Acceder a la API:"
echo "   http://localhost:8000/health (health check)"
echo "   http://localhost:8000/docs (documentación interactiva)"
echo ""
echo "Para más detalles, ver: /var/www/brainhub/DEPLOYMENT_GUIDE.md"
echo "========================================="
