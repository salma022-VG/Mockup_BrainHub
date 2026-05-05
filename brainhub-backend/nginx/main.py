from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, pomodoro, notas, comunidad, ia
from app.db.database import Base, engine
from app.core.config import settings

# Crear tablas automáticamente al iniciar (opcional si usas Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BrainHub Studio API",
    description="Backend para la aplicación de Pomodoro + IA + Comunidad",
    version="1.0.0"
)

# Configuración de CORS para permitir que el frontend se conecte
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de Routers
app.include_router(auth.router, prefix="/api")
# Asumiendo que los otros módulos tienen un objeto 'router' definido:
# app.include_router(pomodoro.router, prefix="/api")
# app.include_router(notas.router, prefix="/api")
# app.include_router(comunidad.router, prefix="/api")
# app.include_router(ia.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "message": "Bienvenido a BrainHub Studio API",
        "docs": "/docs",
        "status": "online"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)