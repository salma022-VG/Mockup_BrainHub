"""
Configuración centralizada de la aplicación BrainHub
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Configuración de la aplicación. 
    Las variables se cargan desde .env o variables de entorno del sistema
    """
    
    # ═══════════════════════════════════════
    # POSTGRESQL
    # ═══════════════════════════════════════
    POSTGRES_USER: str = "brainhub_user"
    POSTGRES_PASSWORD: str = "secure_password_change_me"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "brainhub_db"
    
    @property
    def DATABASE_URL(self) -> str:
        """Construye la URL de conexión a PostgreSQL"""
        return f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # ═══════════════════════════════════════
    # JWT & SEGURIDAD
    # ═══════════════════════════════════════
    SECRET_KEY: str = "change_me_in_production_use_strong_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # ═══════════════════════════════════════
    # API ANTHROPIC (Claude AI)
    # ═══════════════════════════════════════
    ANTHROPIC_API_KEY: Optional[str] = None
    
    # ═══════════════════════════════════════
    # MODELO DE IA (Falcon 7B local o Claude)
    # ═══════════════════════════════════════
    IA_PROVIDER: str = "anthropic"  # "anthropic" o "falcon"
    FALCON_API_URL: str = "http://localhost:8001"  # URL del servidor Falcon local
    
    # ═══════════════════════════════════════
    # APLICACIÓN
    # ═══════════════════════════════════════
    APP_NAME: str = "BrainHub Studio Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"  # development, staging, production
    
    # ═══════════════════════════════════════
    # CORS
    # ═══════════════════════════════════════
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost", "http://127.0.0.1"]
    CORS_CREDENTIALS: bool = True
    CORS_METHODS: list = ["*"]
    CORS_HEADERS: list = ["*"]
    
    # ═══════════════════════════════════════
    # ARCHIVOS
    # ═══════════════════════════════════════
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
