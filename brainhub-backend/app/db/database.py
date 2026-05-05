"""
Configuración de conexión a PostgreSQL y sesiones de base de datos
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Corregir URL de base de datos si es necesario (compatibilidad postgres:// vs postgresql://)
database_url = settings.DATABASE_URL
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# Motor de base de datos
engine = create_engine(
    database_url,
    pool_pre_ping=True,  # Verifica la conexión antes de usar
    echo=settings.DEBUG,  # Log de SQL en desarrollo
    pool_size=10,
    max_overflow=20,
)

# Sesión local para transacciones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos
Base = declarative_base()


def get_db():
    """
    Dependencia para inyectar la sesión de BD en las rutas FastAPI
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
