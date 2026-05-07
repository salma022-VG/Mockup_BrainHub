from fastapi import APIRouter

from routes.auth import router as auth_router
from routes.pomodoro import router as pomodoro_router
from routes.notas import router as notas_router
from routes.comunidad import router as comunidad_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(pomodoro_router)
api_router.include_router(notas_router)
api_router.include_router(comunidad_router)
