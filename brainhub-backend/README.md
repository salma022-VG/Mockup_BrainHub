# 🧠 BrainHub Studio Backend

**Backend API en Python (FastAPI)** para la aplicación de Pomodoro + IA + Comunidad estudiantil.

## 📋 Tabla de Contenidos

- [Requisitos](#requisitos)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación Local](#instalación-local)
- [Despliegue en AWS](#despliegue-en-aws)
- [Configuración](#configuración)
- [API Endpoints](#api-endpoints)
- [Base de Datos](#base-de-datos)
- [Troubleshooting](#troubleshooting)

---

## 📦 Requisitos

### Local (Desarrollo)
- Python 3.12+
- PostgreSQL 14+
- pip/venv
- Git

### AWS (Producción)
- EC2 Instance (t3.small mínimo)
- Ubuntu Server 24.04 LTS
- Security Group con puertos 22, 80, 443 abiertos
- RDS PostgreSQL (opcional, recomendado)

---

## 📁 Estructura del Proyecto

```
brainhub-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # Aplicación FastAPI principal
│   ├── api/
│   │   ├── auth.py                # Autenticación y JWT
│   │   ├── pomodoro.py            # Endpoints de Pomodoro
│   │   ├── notas.py               # Endpoints de Notas
│   │   ├── comunidad.py           # Endpoints de Comunidad/Publicaciones
│   │   └── ia.py                  # Endpoints de Chat IA (Orion)
│   ├── models/
│   │   └── models.py              # Modelos SQLAlchemy
│   ├── schemas/
│   │   └── schemas.py             # Esquemas Pydantic
│   ├── core/
│   │   ├── config.py              # Configuración centralizada
│   │   └── security.py            # JWT, contraseñas, autenticación
│   └── db/
│       └── database.py            # Conexión a PostgreSQL
├── nginx/
│   └── brainhub.conf              # Configuración reverse proxy
├── deploy/
│   ├── setup.sh                   # Script instalación completa
│   └── init-aws.sh                # Inicialización AWS EC2
├── requirements.txt               # Dependencias Python
├── .env.example                   # Template de variables de entorno
├── README.md                      # Este archivo
└── schema_v3_brainhub.sql         # Schema PostgreSQL
```

---

## 🚀 Instalación Local

### 1. Clonar repositorio

```bash
git clone <repo-url>
cd brainhub-backend
```

### 2. Crear entorno virtual

```bash
python3.12 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus valores
nano .env
```

**Variables clave a modificar:**
```env
POSTGRES_PASSWORD=tu_contraseña_segura
SECRET_KEY=tu_clave_secreta_aleatoria_min_32_chars
ANTHROPIC_API_KEY=tu_api_key_de_claude
ENVIRONMENT=development
DEBUG=True
```

### 5. Crear base de datos PostgreSQL

```bash
# Conectar a PostgreSQL
psql -U postgres

# En el prompt de psql:
CREATE USER brainhub_user WITH PASSWORD 'tu_contraseña';
CREATE DATABASE brainhub_db OWNER brainhub_user;
GRANT ALL PRIVILEGES ON DATABASE brainhub_db TO brainhub_user;
\q
```

### 6. Crear tablas

Las tablas se crean automáticamente al iniciar la aplicación (ver `app/main.py`).

### 7. Ejecutar servidor

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Acceso:**
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 🏗️ Despliegue en AWS

### Paso 1: Crear instancia EC2

```bash
# AWS CLI o consola:
# - AMI: Ubuntu Server 24.04 LTS
# - Tipo: t3.small (mínimo)
# - Storage: 20 GB
# - Security Group:
#   - SSH (22): tu IP
#   - HTTP (80): 0.0.0.0/0
#   - HTTPS (443): 0.0.0.0/0
```

### Paso 2: Conectar a la instancia

```bash
ssh -i "clave.pem" ubuntu@ec2-xxx.compute.amazonaws.com
```

### Paso 3: Descargar código

```bash
cd /tmp
git clone <repo-url>
cd brainhub-backend
chmod +x deploy/setup.sh
```

### Paso 4: Ejecutar script de instalación

```bash
sudo ./deploy/setup.sh
```

Este script hace automáticamente:
- ✅ Actualiza paquetes del sistema
- ✅ Instala Python 3.12, PostgreSQL, Nginx
- ✅ Configura base de datos
- ✅ Instala dependencias Python
- ✅ Configura Nginx como reverse proxy
- ✅ Crea servicio systemd para FastAPI
- ✅ Configura firewall (UFW)

### Paso 5: Configurar archivos de entorno

```bash
sudo nano /opt/brainhub/.env
```

**IMPORTANTE:** Cambiar en producción:
- `POSTGRES_PASSWORD`: Contraseña segura
- `SECRET_KEY`: Clave aleatoria de 32+ caracteres
- `ANTHROPIC_API_KEY`: Tu API key de Anthropic
- `CORS_ORIGINS`: Tu dominio en HTTPS
- `ENVIRONMENT`: `production`
- `DEBUG`: `False`

### Paso 6: Obtener certificado SSL

```bash
sudo certbot --nginx -d brainhub.example.com
# Seguir las instrucciones interactivas
```

### Paso 7: Verificar servicios

```bash
# Ver estado
sudo systemctl status brainhub
sudo systemctl status nginx
sudo systemctl status postgresql

# Ver logs
sudo journalctl -u brainhub -f
sudo tail -f /var/log/nginx/brainhub_error.log

# Health check
curl https://brainhub.example.com/health
```

---

## ⚙️ Configuración

### Variables de Entorno (.env)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `POSTGRES_USER` | Usuario PostgreSQL | `brainhub_user` |
| `POSTGRES_PASSWORD` | Contraseña DB | `contraseña_segura` |
| `POSTGRES_HOST` | Host PostgreSQL | `localhost` o RDS endpoint |
| `POSTGRES_PORT` | Puerto PostgreSQL | `5432` |
| `POSTGRES_DB` | Nombre base de datos | `brainhub_db` |
| `SECRET_KEY` | Clave JWT (32+ chars) | `abcdef...` |
| `ALGORITHM` | Algoritmo JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración token acceso | `30` |
| `ANTHROPIC_API_KEY` | API Key Claude | `sk-ant-...` |
| `ENVIRONMENT` | Entorno | `production` o `development` |
| `DEBUG` | Modo debug | `False` en producción |
| `CORS_ORIGINS` | Orígenes CORS permitidos | `["https://ejemplo.com"]` |

### PostgreSQL en AWS RDS (Recomendado)

Si usas RDS en lugar de instancia local:

```env
POSTGRES_HOST=brainhub-db.c9akciq32.us-east-1.rds.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_USER=admin
POSTGRES_PASSWORD=tu_contraseña_rds
POSTGRES_DB=brainhub_db
```

**Pasos:**
1. Crear RDS PostgreSQL (Multi-AZ, backup automático)
2. Crear security group que permita acceso desde EC2
3. Copiar endpoint en POSTGRES_HOST

---

## 🔌 API Endpoints

### Autenticación

```http
POST /auth/register
POST /auth/login
GET  /auth/me
```

### Pomodoro

```http
GET    /pomodoro/config
PUT    /pomodoro/config
POST   /pomodoro/sesiones
GET    /pomodoro/sesiones
PUT    /pomodoro/sesiones/{sesion_id}/completar
GET    /pomodoro/estadisticas
```

### Notas

```http
POST   /notas
GET    /notas
GET    /notas/{nota_id}
PUT    /notas/{nota_id}
DELETE /notas/{nota_id}
```

### Comunidad

```http
POST   /comunidad/publicaciones
GET    /comunidad/publicaciones
GET    /comunidad/publicaciones/{pub_id}
PUT    /comunidad/publicaciones/{pub_id}/like
DELETE /comunidad/publicaciones/{pub_id}
GET    /comunidad/leaderboard
```

### IA (Chat con Claude)

```http
POST   /ia/chats
GET    /ia/chats
GET    /ia/chats/{chat_id}
POST   /ia/chats/{chat_id}/mensajes
DELETE /ia/chats/{chat_id}
```

**Ver documentación interactiva:** https://brainhub.example.com/docs

---

## 💾 Base de Datos

### Crear estructura inicial

```bash
# Opción 1: Automático (recomendado)
# Las tablas se crean automáticamente en app/main.py

# Opción 2: Manual
psql -U brainhub_user -d brainhub_db -f schema_v3_brainhub.sql
```

### Hacer backup

```bash
# Backup completo
pg_dump -U brainhub_user brainhub_db > backup.sql

# Restaurar
psql -U brainhub_user brainhub_db < backup.sql
```

### Monitoreo

```bash
# Conectar a PostgreSQL
psql -U brainhub_user -d brainhub_db

# Comandos útiles:
\dt                    # Listar tablas
SELECT COUNT(*) FROM usuarios;
SELECT * FROM sesiones_pomodoro;
\q
```

---

## 📊 Monitoreo y Mantenimiento

### Ver logs en tiempo real

```bash
# Backend FastAPI
sudo journalctl -u brainhub -f

# Nginx
sudo tail -f /var/log/nginx/brainhub_error.log
sudo tail -f /var/log/nginx/brainhub_access.log

# PostgreSQL
sudo tail -f /var/log/postgresql/postgresql.log
```

### Reiniciar servicios

```bash
# Reiniciar FastAPI
sudo systemctl restart brainhub

# Reiniciar Nginx
sudo systemctl restart nginx

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Reiniciar todo
sudo systemctl restart brainhub nginx postgresql
```

### Health checks

```bash
# API
curl https://brainhub.example.com/health

# PostgreSQL
sudo -u postgres psql -c "SELECT version();"

# Nginx
sudo nginx -t
```

---

## 🐛 Troubleshooting

### Error: "Connection refused" en PostgreSQL

```bash
# Verificar que PostgreSQL esté ejecutándose
sudo systemctl status postgresql

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Revisar conexión
psql -U brainhub_user -h localhost -d brainhub_db
```

### Error: "Address already in use" (puerto 8000)

```bash
# Encontrar proceso usando puerto
sudo lsof -i :8000

# Matar proceso
sudo kill -9 <PID>

# O cambiar puerto en systemd
sudo nano /etc/systemd/system/brainhub.service
# Cambiar: --port 8001
sudo systemctl daemon-reload
sudo systemctl restart brainhub
```

### Nginx retorna 502 Bad Gateway

```bash
# Verificar que FastAPI esté corriendo
sudo systemctl status brainhub

# Ver logs
sudo journalctl -u brainhub -n 50

# Reiniciar
sudo systemctl restart brainhub nginx
```

### Error en Claude API

```bash
# Verificar API key en .env
sudo cat /opt/brainhub/.env | grep ANTHROPIC

# Probar conexión
curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
  https://api.anthropic.com/v1/messages
```

### Base de datos sin tablas

```bash
# Las tablas se crean automáticamente al iniciar app/main.py
# Si no se crean, ejecutar:

cd /opt/brainhub
source venv/bin/activate
python -c "from app.db.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

---

## 🔐 Seguridad en Producción

### Checklist

- [ ] `ENVIRONMENT=production`
- [ ] `DEBUG=False`
- [ ] `SECRET_KEY` >= 32 caracteres aleatorios
- [ ] HTTPS/SSL habilitado (Let's Encrypt)
- [ ] CORS restringido a tu dominio
- [ ] PostgreSQL con contraseña fuerte
- [ ] Firewall habilitado (UFW)
- [ ] Backups automáticos configurados
- [ ] Monitoreo y alertas activos

### Backups Automáticos

```bash
# Script: /opt/brainhub/backup.sh
#!/bin/bash
pg_dump -U brainhub_user brainhub_db | gzip > /backups/brainhub_$(date +%Y%m%d).sql.gz

# Agregar a crontab (diario a las 2 AM)
0 2 * * * /opt/brainhub/backup.sh
```

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisar logs: `sudo journalctl -u brainhub -f`
2. Verificar configuración .env
3. Consultar documentación API: https://brainhub.example.com/docs

---

## 📄 Licencia

BrainHub Studio © 2024. Todos los derechos reservados.

---

**¡El backend está listo para producción!** 🚀
