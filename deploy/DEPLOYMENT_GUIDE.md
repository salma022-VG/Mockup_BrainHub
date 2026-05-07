# Guía de Despliegue BrainHub en AWS Ubuntu Server 24.04

## Requisitos Previos
- Instancia EC2 en AWS con Ubuntu Server 24.04
- Dominio configurado (ej: brainhub.example.com)
- Acceso SSH a la instancia
- IP elástica asignada

## Paso 1: Actualizar el Sistema

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3.12 python3.12-venv python3.12-dev \
    postgresql postgresql-contrib \
    nginx \
    certbot python3-certbot-nginx \
    git \
    build-essential \
    curl
```

## Paso 2: Crear Usuario y Directorios

```bash
# Crear usuario para la aplicación
sudo useradd -m -s /bin/bash brainhub

# Crear estructura de directorios
sudo mkdir -p /var/www/brainhub/{backend,frontend}
sudo chown -R brainhub:brainhub /var/www/brainhub
```

## Paso 3: Configurar PostgreSQL

```bash
sudo -u postgres psql << EOF
CREATE USER brainhub_user WITH PASSWORD 'brainhub_password';
CREATE DATABASE brainhub_db OWNER brainhub_user;
ALTER ROLE brainhub_user SET client_encoding TO 'utf8';
ALTER ROLE brainhub_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE brainhub_user SET default_transaction_deferrable TO on;
ALTER ROLE brainhub_user SET default_transaction_level TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE brainhub_db TO brainhub_user;
EOF
```

## Paso 4: Restaurar Base de Datos

```bash
sudo -u postgres psql brainhub_db < schema_v3_brainhub.sql
```

## Paso 5: Desplegar Backend

```bash
# Clonar o copiar el código
cd /var/www/brainhub/backend
git clone <tu-repo> . 2>/dev/null || echo "Ya existe código"

# Crear entorno virtual
python3.12 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
nano .env

# Crear directorio de logs
mkdir -p logs
chmod 755 logs
```

## Paso 6: Desplegar Frontend

```bash
cd /var/www/brainhub/frontend
# Copiar archivos compilados de React
# Si compilaste localmente:
npm run build
cp -r dist/* /var/www/brainhub/frontend/

# O si prefieres compilar en el servidor:
npm install
npm run build
```

## Paso 7: Configurar Systemd para el Backend

```bash
# Copiar archivo de servicio
sudo cp deploy/brainhub.service /etc/systemd/system/

# Ajustar permisos
sudo chown root:root /etc/systemd/system/brainhub.service
sudo chmod 644 /etc/systemd/system/brainhub.service

# Recargar systemd y iniciar servicio
sudo systemctl daemon-reload
sudo systemctl enable brainhub
sudo systemctl start brainhub

# Verificar estado
sudo systemctl status brainhub
```

## Paso 8: Configurar Nginx

```bash
# Copiar configuración
sudo cp deploy/nginx.conf /etc/nginx/sites-available/brainhub

# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/brainhub /etc/nginx/sites-enabled/brainhub

# Verificar sintaxis
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

## Paso 9: Configurar SSL con Let's Encrypt

```bash
# Obtener certificado
sudo certbot certonly --nginx -d brainhub.example.com -d www.brainhub.example.com

# Verificar renovación automática
sudo systemctl status certbot.timer
sudo systemctl enable certbot.timer
```

## Paso 10: Ajustar Nginx para HTTPS

```bash
# El certificado ya está configurado en nginx.conf
# Solo necesitas actualizar el dominio:
sudo sed -i 's/brainhub.example.com/tu-dominio.com/g' /etc/nginx/sites-available/brainhub

# Verificar y recargar
sudo nginx -t
sudo systemctl reload nginx
```

## Paso 11: Firewall y Seguridad

```bash
# Configurar UFW
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 5432/tcp  # PostgreSQL (solo si es necesario)

# Verificar
sudo ufw status
```

## Paso 12: Monitoreo y Logs

```bash
# Logs del backend
sudo journalctl -u brainhub -f

# Logs de Nginx
tail -f /var/log/nginx/brainhub_access.log
tail -f /var/log/nginx/brainhub_error.log

# Logs de PostgreSQL
tail -f /var/log/postgresql/postgresql-*.log
```

## Paso 13: Backup Automático

```bash
# Crear script de backup
sudo tee /usr/local/bin/backup-brainhub.sh > /dev/null << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/brainhub"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup de BD
sudo -u postgres pg_dump brainhub_db | gzip > $BACKUP_DIR/brainhub_db_$DATE.sql.gz

# Backup de código y datos
tar -czf $BACKUP_DIR/brainhub_app_$DATE.tar.gz /var/www/brainhub/

# Mantener solo últimos 7 días
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completado: $DATE"
EOF

sudo chmod +x /usr/local/bin/backup-brainhub.sh

# Configurar cron para backup diario a las 2 AM
sudo tee /etc/cron.d/brainhub-backup > /dev/null << 'EOF'
0 2 * * * root /usr/local/bin/backup-brainhub.sh
EOF
```

## Verificación Final

```bash
# Verificar que el backend está respondiendo
curl http://localhost:8000/health
# Debería retornar: {"status":"ok"}

# Verificar que Nginx está sirviendo
curl -I http://localhost/
# Debería retornar: HTTP/1.1 200 OK

# Prueba de API completa
curl -X POST http://localhost/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","apellido":"User","email":"test@example.com","password":"password123"}'
```

## Troubleshooting

### Backend no inicia
```bash
sudo systemctl status brainhub
sudo journalctl -u brainhub -n 50
```

### Error de conexión a BD
- Verificar que PostgreSQL está corriendo: `sudo systemctl status postgresql`
- Verificar credenciales en `.env`
- Verificar que la BD existe: `sudo -u postgres psql -l`

### Nginx no sirve archivos
- Verificar permisos: `ls -la /var/www/brainhub/frontend/`
- Verificar que index.html existe
- Revisar: `/var/log/nginx/brainhub_error.log`

### SSL no funciona
- Verificar certificados: `sudo certbot certificates`
- Renovar manualmente: `sudo certbot renew --dry-run`

## Monitoreo Recomendado

Considera agregar:
- CloudWatch (monitoreo de EC2)
- New Relic o DataDog (APM)
- UptimeRobot (health checks externos)
