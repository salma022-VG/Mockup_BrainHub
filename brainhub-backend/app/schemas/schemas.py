"""
Esquemas Pydantic para validación de request/response
"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from uuid import UUID


# ═══════════════════════════════════════════════════
# USUARIOS
# ═══════════════════════════════════════════════════

class UsuarioCreate(BaseModel):
    nombre: str
    apellido: str
    apodo: Optional[str] = None
    email: EmailStr
    password: str


class UsuarioResponse(BaseModel):
    id: UUID
    nombre: str
    apellido: str
    apodo: Optional[str]
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════════
# AUTENTICACIÓN
# ═══════════════════════════════════════════════════

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# ═══════════════════════════════════════════════════
# POMODORO
# ═══════════════════════════════════════════════════

class ConfigPomodoroResponse(BaseModel):
    usuario_id: UUID
    duracion_trabajo_min: int
    descanso_corto_min: int
    descanso_largo_min: int
    ciclos_antes_largo: int
    meta_diaria: int
    sonido_activo: bool
    auto_iniciar: bool
    
    class Config:
        from_attributes = True


class SesionPomodoroCreate(BaseModel):
    modo: str  # "work", "short", "long"
    duracion_min: int


class SesionPomodoroResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    modo: str
    estado: str
    duracion_min: int
    inicio: datetime
    fin: Optional[datetime]
    
    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════════
# NOTAS
# ═══════════════════════════════════════════════════

class NotaCreate(BaseModel):
    contenido: str
    etiqueta_id: Optional[int] = None


class NotaUpdate(BaseModel):
    contenido: Optional[str] = None
    completada: Optional[bool] = None
    etiqueta_id: Optional[int] = None


class NotaResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    contenido: str
    completada: bool
    etiqueta_id: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════════
# CHAT IA
# ═══════════════════════════════════════════════════

class MensajeChatCreate(BaseModel):
    contenido: str


class MensajeChatResponse(BaseModel):
    id: UUID
    chat_id: UUID
    rol: str
    contenido: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class ChatIACreate(BaseModel):
    titulo: Optional[str] = None


class ChatIAResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    titulo: Optional[str]
    created_at: datetime
    mensajes: list[MensajeChatResponse] = []
    
    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════════
# COMUNIDAD / PUBLICACIONES
# ═══════════════════════════════════════════════════

class PublicacionCreate(BaseModel):
    categoria_id: int
    titulo: str
    cuerpo: str


class PublicacionResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    nick: str
    titulo: str
    cuerpo: str
    categoria_id: int
    likes: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════════
# LEADERBOARD
# ═══════════════════════════════════════════════════

class LeaderboardResponse(BaseModel):
    nick: str
    pomodoros_totales: int
    posicion: int
    
    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════════
# ESTADÍSTICAS
# ═══════════════════════════════════════════════════

class EstadisticaResponse(BaseModel):
    usuario_id: UUID
    fecha: str
    pomodoros_completados: int
    minutos_enfocados: int
    tareas_completadas: int
    meta_alcanzada: bool
    
    class Config:
        from_attributes = True
