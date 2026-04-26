# 🚀 Guía Rápida - BrainHub Backend

## Inicio Rápido (Desarrollo)

### Opción 1: Directo con Python

```bash
# 1. Crear entorno virtual
python3.12 -m venv venv
source venv/bin/activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Crear archivo .env
cp .env.example .env

# 4. Iniciar PostgreSQL (asegúrate de que esté corriendo)
# En otra terminal:
sudo systemctl start postgresql

# 5. Ejecutar migrations (crear tablas)
# Se hace automáticamente al iniciar, pero puedes hacer:
python -c "from app.db.database import Base, engine; Base.metadata.create_all(bind=engine)"

# 6. Iniciar servidor
uvicorn app.main:app --reload

# API disponible en: http://localhost:8000
# Documentación: http://localhost:8000/docs
```

### Opción 2: Docker Compose (Recomendado)

```bash
# 1. Iniciar todos los servicios
docker-compose up -d

# 2. Ver logs
docker-compose logs -f backend

# 3. Acceder a API
http://localhost:8000/docs

# 4. Detener
docker-compose down
```

---

## Primeros Pasos

### 1. Registrar usuario

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "apodo": "juanperez",
    "email": "juan@example.com",
    "password": "contraseña123"
  }'
```

### 2. Login

```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "contraseña123"
  }'

# Respuesta:
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### 3. Usar token en requests

```bash
# Guardar token
TOKEN="eyJhbGc..."

# Hacer request autenticado
curl -X GET "http://localhost:8000/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Estructura de Carpetas

```
brainhub-backend/
├── app/
│   ├── api/          # Rutas de la API
│   ├── models/       # Modelos de BD
│   ├── schemas/      # Esquemas Pydantic
│   ├── core/         # Configuración y seguridad
│   ├── db/           # Conexión a BD
│   └── main.py       # Aplicación principal
├── nginx/            # Configuración Nginx
├── deploy/           # Scripts de despliegue
├── requirements.txt  # Dependencias
├── .env.example      # Template .env
└── README.md         # Documentación completa
```

---

## Comandos Útiles

### Desarrollo

```bash
# Iniciar en modo recarga automática
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Con más detalles
uvicorn app.main:app --reload --log-level debug

# Desde raíz del proyecto
python -m uvicorn app.main:app --reload
```

### Base de Datos

```bash
# Conectar a PostgreSQL
psql -U brainhub_user -d brainhub_db

# Desde el código
python -c "from app.db.database import SessionLocal; db = SessionLocal(); print('Conexión OK')"
```

### Tests (opcional)

```bash
# Instalar pytest
pip install pytest httpx

# Ejecutar tests
pytest tests/ -v
```

---

## Variables de Entorno Clave

```env
# Base de datos
POSTGRES_USER=brainhub_user
POSTGRES_PASSWORD=password
POSTGRES_HOST=localhost
POSTGRES_DB=brainhub_db

# Seguridad
SECRET_KEY=tu-clave-super-secreta
ANTHROPIC_API_KEY=sk-ant-...

# Desarrollo
DEBUG=True
ENVIRONMENT=development
```

---

## Troubleshooting Rápido

### "Connection refused" (PostgreSQL)

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# En macOS con Homebrew
brew services start postgresql

# En Windows (CMD como admin)
net start PostgreSQL-x64-15
```

### "Port 8000 already in use"

```bash
# Encontrar y matar proceso
lsof -i :8000
kill -9 <PID>

# O usar otro puerto
uvicorn app.main:app --port 8001
```

### Módulos no encontrados

```bash
# Asegúrate de estar en el venv
source venv/bin/activate

# Reinstalar dependencias
pip install -r requirements.txt
```

---

## Despliegue en AWS

Para instrucciones completas, ver [README.md](README.md#despliegue-en-aws)

**Resumen rápido:**
```bash
# 1. SSH a instancia EC2
ssh -i clave.pem ubuntu@ec2-xxx.amazonaws.com

# 2. Descargar y ejecutar setup
git clone <repo>
cd brainhub-backend
sudo ./deploy/setup.sh

# 3. Configurar .env
sudo nano /opt/brainhub/.env

# 4. Obtener SSL
sudo certbot --nginx -d brainhub.example.com

# 5. Verificar
curl https://brainhub.example.com/health
```

---

## API Endpoints Principales

```
# Autenticación
POST   /auth/register
POST   /auth/login
GET    /auth/me

# Pomodoro
GET    /pomodoro/config
POST   /pomodoro/sesiones
GET    /pomodoro/sesiones
GET    /pomodoro/estadisticas

# Notas
POST   /notas
GET    /notas
PUT    /notas/{id}
DELETE /notas/{id}

# Comunidad
POST   /comunidad/publicaciones
GET    /comunidad/publicaciones
GET    /comunidad/leaderboard

# IA
POST   /ia/chats
GET    /ia/chats/{id}
POST   /ia/chats/{id}/mensajes
```

**Ver todos en:** http://localhost:8000/docs

---

## Próximos Pasos

1. ✅ Backend corriendo localmente
2. ✅ Conectar frontend (index.html)
3. ✅ Probar endpoints en /docs
4. ✅ Desplegar en AWS
5. ✅ Configurar dominio y SSL
6. ✅ Monitoreo y backups

---

**¿Necesitas ayuda?** Revisar logs:
```bash
# Local
tail -f app.log

# Docker
docker-compose logs -f backend

# AWS
sudo journalctl -u brainhub -f
```

¡Éxito! 🚀
