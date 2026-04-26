"""
Configuración de conexión a PostgreSQL y sesiones de base de datos
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Motor de base de datos
engine = create_engine(
    settings.DATABASE_URL,
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
