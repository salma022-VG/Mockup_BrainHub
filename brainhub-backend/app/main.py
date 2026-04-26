"""
Aplicación principal FastAPI para BrainHub Studio
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.core.config import settings
from app.db.database import Base, engine
from app.api import auth, pomodoro, notas, comunidad, ia
import os

# Crear tablas en la base de datos (en producción usar Alembic)
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Contexto de vida de la aplicación
    """
    print(f"🚀 BrainHub Backend iniciado en {settings.ENVIRONMENT}")
    yield
    print("🛑 BrainHub Backend finalizado")


# Crear aplicación FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API para BrainHub Studio - Pomodoro + IA + Comunidad",
    lifespan=lifespan
)


# ═══════════════════════════════════════════════════
# MIDDLEWARE CORS
# ═══════════════════════════════════════════════════

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_CREDENTIALS,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS
)


# ═══════════════════════════════════════════════════
# RUTAS API
# ═══════════════════════════════════════════════════

app.include_router(auth.router)
app.include_router(pomodoro.router)
app.include_router(notas.router)
app.include_router(comunidad.router)
app.include_router(ia.router)


# ═══════════════════════════════════════════════════
# RUTA RAÍZ
# ═══════════════════════════════════════════════════

@app.get("/")
async def root():
    """
    Endpoint raíz para verificar que el servidor está activo
    """
    return {
        "message": "BrainHub Studio Backend",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    """
    Health check para AWS ELB y monitoreo
    """
    return {
        "status": "healthy",
        "version": settings.APP_VERSION
    }


# ═══════════════════════════════════════════════════
# DOCUMENTACIÓN AUTOMÁTICA
# ═══════════════════════════════════════════════════

# FastAPI genera automáticamente:
# - /docs (Swagger UI)
# - /redoc (ReDoc)
# - /openapi.json (OpenAPI schema)


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
