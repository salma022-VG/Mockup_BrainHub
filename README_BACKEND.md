# BrainHub Backend - Guía de Desarrollo

## Estructura del Proyecto

```
backend/
├── main.py                 # Aplicación principal FastAPI
├── config.py              # Configuración y variables de entorno
├── database.py            # Conexión a BD y sesiones
├── models.py              # Modelos SQLAlchemy
├── schemas.py             # Schemas Pydantic
├── security.py            # Autenticación JWT y hashing
├── wsgi.py                # Entry point para ASGI
├── routes/
│   ├── __init__.py
│   ├── auth.py            # Endpoints de autenticación
│   ├── pomodoro.py        # Endpoints de pomodoro
│   ├── notas.py           # Endpoints de notas
│   └── comunidad.py       # Endpoints de comunidad
├── requirements.txt       # Dependencias Python
├── .env.example          # Variables de entorno (ejemplo)
└── venv/                 # Entorno virtual (no versionar)
```

## Configuración Local

### Requisitos
- Python 3.12+
- PostgreSQL 14+
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd BrainHub/backend
```

2. **Crear entorno virtual**
```bash
python3.12 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. **Instalar dependencias**
```bash
pip install --upgrade pip setuptools
pip install -r requirements.txt
```

4. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales
nano .env
```

Ejemplo de `.env`:
```
DATABASE_URL=postgresql://brainhub_user:brainhub_password@localhost:5432/brainhub_db
SECRET_KEY=tu-clave-secreta-muy-segura-cambiar-en-produccion
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=True
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
```

5. **Crear base de datos**
```bash
# Si PostgreSQL está corriendo localmente:
psql -U postgres << EOF
CREATE USER brainhub_user WITH PASSWORD 'brainhub_password';
CREATE DATABASE brainhub_db OWNER brainhub_user;
ALTER ROLE brainhub_user SET client_encoding TO 'utf8';
ALTER ROLE brainhub_user SET default_transaction_isolation TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE brainhub_db TO brainhub_user;
EOF

# Restaurar schema
psql -U brainhub_user -d brainhub_db < ../schema_v3_brainhub.sql
```

6. **Iniciar el servidor**
```bash
python main.py
# O con uvicorn directamente:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El servidor estará disponible en: **http://localhost:8000**

## Desarrollo

### Documentación de la API

Una vez que el servidor está corriendo, accede a:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### Testing

Crear archivo `test_api.py`:
```python
import requests
import json

BASE_URL = "http://localhost:8000"

# Test de registro
response = requests.post(
    f"{BASE_URL}/api/auth/registro",
    json={
        "nombre": "Juan",
        "apellido": "Pérez",
        "email": "juan@example.com",
        "password": "password123"
    }
)
print("Registro:", response.json())

# Test de login
response = requests.post(
    f"{BASE_URL}/api/auth/login",
    json={
        "email": "juan@example.com",
        "password": "password123"
    }
)
token = response.json()["access_token"]
print("Token:", token)

# Test de crear sesión pomodoro
headers = {"Authorization": f"Bearer {token}"}
response = requests.post(
    f"{BASE_URL}/api/pomodoro/sesiones",
    json={"modo": "work", "duracion_minutos": 25},
    headers=headers
)
print("Sesión creada:", response.json())
```

Ejecutar:
```bash
pip install requests
python test_api.py
```

### Agregar nuevas rutas

1. Crear archivo en `routes/`:
```python
# routes/mi_modulo.py
from fastapi import APIRouter, Depends
from database import get_db

router = APIRouter(prefix="/api/mi_modulo", tags=["mi_modulo"])

@router.get("/")
def listar(db = Depends(get_db)):
    return {"data": []}
```

2. Incluir en `routes/__init__.py`:
```python
from routes.mi_modulo import router as mi_router
api_router.include_router(mi_router)
```

### Mejores Prácticas

- **Validación**: Usar Pydantic schemas para todas las entradas
- **Errores**: Usar HTTPException con status_code apropiado
- **BD**: Usar transacciones para operaciones múltiples
- **Autenticación**: Verificar siempre `current_user` en rutas protegidas
- **Logs**: Usar logger para debugging
- **Tests**: Mantener cobertura de tests

## Variables de Entorno Importantes

| Variable | Default | Descripción |
|----------|---------|-------------|
| DATABASE_URL  | - | Conexión a PostgreSQL |
| SECRET_KEY | - | Clave para JWT (cambiar en prod!) |
| API_HOST | 0.0.0.0 | Host del servidor |
| API_PORT | 8000 | Puerto del servidor |
| API_RELOAD | False | Recargar código en cambios |
| ENVIRONMENT | production | development o production |
| ACCESS_TOKEN_EXPIRE_MINUTES | 30 | Expiración del JWT |
| CORS_ORIGINS | [] | Dominios permitidos |

## Troubleshooting

### Error de conexión a BD
```
Error: could not connect to server: Connection refused
```
- Verificar que PostgreSQL está corriendo: `sudo systemctl status postgresql`
- Verificar credenciales en `.env`
- Verificar puerto: default es 5432

### Error de módulos no encontrados
```
ModuleNotFoundError: No module named 'fastapi'
```
- Activar venv: `source venv/bin/activate`
- Reinstalar deps: `pip install -r requirements.txt`

### Puerto ya en uso
```
Address already in use
```
- Cambiar puerto en comando: `python main.py --port 8001`
- O matar proceso: `lsof -i :8000` y `kill -9 <PID>`

## Despliegue en Producción

Ver: `DEPLOYMENT_GUIDE.md`

Resumen:
1. Crear .env con valores seguros
2. Cambiar `API_RELOAD=False` y `ENVIRONMENT=production`
3. Usar Gunicorn o Uvicorn worker
4. Configurar Nginx como reverse proxy
5. Habilitar HTTPS con Let's Encrypt
6. Configurar backups automáticos
7. Monitorear logs y performance

## Recursos Útiles

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/20/)
- [Pydantic](https://docs.pydantic.dev/latest/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)

## Soporte

Para problemas:
1. Revisar logs: `tail -f /var/log/brainhub/backend.log`
2. Revisar documentación API: `/docs`
3. Ejecutar tests
4. Contactar al equipo de desarrollo