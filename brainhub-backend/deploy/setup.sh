#!/bin/bash

#═══════════════════════════════════════════════════════════════
# Script de instalación y despliegue de BrainHub Backend
# Plataforma: Ubuntu Server 24.04 LTS en AWS EC2
# 
# Uso: chmod +x setup.sh && sudo ./setup.sh
#═══════════════════════════════════════════════════════════════

set -e  # Salir si hay algún error

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     BrainHub Studio Backend - Setup Script                   ║"
echo "║     Ubuntu Server 24.04 LTS + PostgreSQL + Nginx             ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

# Verificar que se ejecute como root
if [[ $EUID -ne 0 ]]; then
   echo "⚠️  Este script debe ejecutarse como root (usar sudo)"
   exit 1
fi

echo ""
echo "📦 Paso 1: Actualizar paquetes del sistema..."
apt-get update
apt-get upgrade -y

echo ""
echo "📦 Paso 2: Instalar dependencias del sistema..."
apt-get install -y \
    python3.12 \
    python3.12-venv \
    python3-pip \
    postgresql \
    postgresql-contrib \
    nginx \
    git \
    curl \
    wget \
    sudo \
    ufw \
    certbot \
    python3-certbot-nginx

echo ""
echo "🐘 Paso 3: Configurar PostgreSQL..."

# Iniciar PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Crear usuario y base de datos de BrainHub
sudo -u postgres psql << EOF
CREATE USER brainhub_user WITH PASSWORD 'brainhub_password_change_me';
CREATE DATABASE brainhub_db OWNER brainhub_user;
GRANT ALL PRIVILEGES ON DATABASE brainhub_db TO brainhub_user;
ALTER DATABASE brainhub_db OWNER TO brainhub_user;
EOF

echo "✅ PostgreSQL configurado"

echo ""
echo "🐍 Paso 4: Crear entorno virtual Python..."

# Crear directorio de aplicación
mkdir -p /opt/brainhub
cd /opt/brainhub

# Crear venv
python3.12 -m venv venv
source venv/bin/activate

echo ""
echo "📦 Paso 5: Instalar dependencias Python..."
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt  # Asegúrate de copiar requirements.txt aquí

echo ""
echo "🌐 Paso 6: Configurar Nginx..."

# Copiar configuración de Nginx
cp /opt/brainhub/nginx/brainhub.conf /etc/nginx/sites-available/brainhub
ln -sf /etc/nginx/sites-available/brainhub /etc/nginx/sites-enabled/brainhub

# Eliminar default site
rm -f /etc/nginx/sites-enabled/default

# Crear directorio para frontend
mkdir -p /var/www/brainhub
cp /opt/brainhub/index.html /var/www/brainhub/
chown -R www-data:www-data /var/www/brainhub

# Verificar sintaxis Nginx
nginx -t

# Recargar Nginx
systemctl restart nginx
systemctl enable nginx

echo ""
echo "🔒 Paso 7: Configurar Firewall (UFW)..."

ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

echo ""
echo "📋 Paso 8: Crear archivo .env..."

if [ ! -f /opt/brainhub/.env ]; then
    cp .env.example /opt/brainhub/.env
    echo "⚠️  Editar /opt/brainhub/.env con tus valores reales (IMPORTANTE)"
fi

echo ""
echo "🚀 Paso 9: Crear servicio systemd para FastAPI..."

cat > /etc/systemd/system/brainhub.service << 'SYSTEMD_EOF'
[Unit]
Description=BrainHub Studio Backend (FastAPI)
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=notify
User=ubuntu
WorkingDirectory=/opt/brainhub
Environment="PATH=/opt/brainhub/venv/bin"
EnvironmentFile=/opt/brainhub/.env
ExecStart=/opt/brainhub/venv/bin/uvicorn app.main:app \
    --host 127.0.0.1 \
    --port 8000 \
    --workers 4 \
    --log-level info

Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SYSTEMD_EOF

systemctl daemon-reload
systemctl enable brainhub
systemctl start brainhub

echo ""
echo "📊 Paso 10: Inicializar base de datos..."

source /opt/brainhub/venv/bin/activate
cd /opt/brainhub

# Las tablas se crean automáticamente en app.main.py con:
# Base.metadata.create_all(bind=engine)

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                   ✅ INSTALACIÓN COMPLETADA                  ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║                    PRÓXIMOS PASOS:                            ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║                                                               ║"
echo "║  1. 📝 Editar archivo .env con valores reales:               ║"
echo "║     sudo nano /opt/brainhub/.env                             ║"
echo "║                                                               ║"
echo "║     Variables importantes a cambiar:                          ║"
echo "║     - POSTGRES_PASSWORD (contraseña segura)                  ║"
echo "║     - SECRET_KEY (clave JWT fuerte)                          ║"
echo "║     - ANTHROPIC_API_KEY (token de Claude API)                ║"
echo "║     - CORS_ORIGINS (dominio de producción)                   ║"
echo "║                                                               ║"
echo "║  2. 🔐 Configurar SSL/TLS con Let's Encrypt:                 ║"
echo "║     sudo certbot --nginx -d brainhub.example.com             ║"
echo "║                                                               ║"
echo "║  3. 🔄 Reiniciar servicios:                                  ║"
echo "║     sudo systemctl restart brainhub nginx                    ║"
echo "║                                                               ║"
echo "║  4. ✅ Verificar estado:                                     ║"
echo "║     sudo systemctl status brainhub                           ║"
echo "║     curl http://localhost/health                             ║"
echo "║                                                               ║"
echo "║  5. 📊 Ver logs:                                             ║"
echo "║     sudo journalctl -u brainhub -f                           ║"
echo "║     sudo tail -f /var/log/nginx/brainhub_error.log           ║"
echo "║                                                               ║"
echo "║  INFORMACIÓN DE ACCESO:                                       ║"
echo "║  ────────────────────────────────────────────────────────    ║"
echo "║  - API Backend:  http://localhost:8000                       ║"
echo "║  - API Docs:     http://localhost:8000/docs                  ║"
echo "║  - ReDoc:        http://localhost:8000/redoc                 ║"
echo "║  - Health Check: http://localhost/health                     ║"
echo "║                                                               ║"
echo "║  PostgreSQL:                                                  ║"
echo "║  ────────────────────────────────────────────────────────    ║"
echo "║  - Host: localhost                                            ║"
echo "║  - Puerto: 5432                                               ║"
echo "║  - Base de datos: brainhub_db                                ║"
echo "║  - Usuario: brainhub_user                                    ║"
echo "║  - Password: (configurar en .env)                            ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

echo ""
echo "🔍 Verificando servicios..."
systemctl is-active --quiet brainhub && echo "✅ FastAPI: ACTIVO" || echo "❌ FastAPI: INACTIVO"
systemctl is-active --quiet postgresql && echo "✅ PostgreSQL: ACTIVO" || echo "❌ PostgreSQL: INACTIVO"
systemctl is-active --quiet nginx && echo "✅ Nginx: ACTIVO" || echo "❌ Nginx: INACTIVO"

echo ""
echo "✨ ¡Despliegue completado! El servidor está listo para producción."
