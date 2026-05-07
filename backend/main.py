from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from config import settings
from database import engine, Base
from routes import api_router

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BrainHub API",
    description="API Backend para BrainHub Studio - Pomodoro + Notas + IA + Comunidad",
    version="1.0.0"
)

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware para hosts confiables
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]
)

# Incluir rutas
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "message": "Bienvenido a BrainHub API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD
    )
