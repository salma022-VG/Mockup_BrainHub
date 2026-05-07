from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID
from typing import Optional, List
from enum import Enum

# Auth
class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str

class UsuarioRegistro(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UsuarioResponse(BaseModel):
    id: UUID
    nombre: str
    apellido: str
    apodo: Optional[str]
    email: str
    email_verificado: bool
    plan_id: int
    ultimo_login: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

# Pomodoro
class SesionPomodoroCreate(BaseModel):
    modo: str  # "work", "short", "long"
    duracion_minutos: int

class SesionPomodoroUpdate(BaseModel):
    estado: str
    tiempo_transcurrido: Optional[int]

class SesionPomodoroResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    modo: str
    duracion_minutos: int
    estado: str
    tiempo_transcurrido: int
    created_at: datetime
    finalizado_at: Optional[datetime]

    class Config:
        from_attributes = True

# Notas
class NotaCreate(BaseModel):
    titulo: str
    contenido: Optional[str]
    etiqueta_id: Optional[int]
    color: Optional[str]

class NotaUpdate(BaseModel):
    titulo: Optional[str]
    contenido: Optional[str]
    etiqueta_id: Optional[int]
    color: Optional[str]

class NotaResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    titulo: str
    contenido: Optional[str]
    etiqueta_id: Optional[int]
    color: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# IA
class MensajeIACreate(BaseModel):
    contenido: str
    rol: str = "user"

class MensajeIAResponse(BaseModel):
    id: UUID
    conversacion_id: UUID
    rol: str
    contenido: str
    created_at: datetime

    class Config:
        from_attributes = True

class ConversacionIAResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    titulo: Optional[str]
    created_at: datetime
    mensajes: Optional[List[MensajeIAResponse]]

    class Config:
        from_attributes = True

# Comunidad
class PublicacionComunidadCreate(BaseModel):
    categoria_id: int
    titulo: str
    contenido: Optional[str]

class PublicacionComunidadResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    categoria_id: int
    titulo: str
    contenido: Optional[str]
    estado: str
    likes: int
    created_at: datetime

    class Config:
        from_attributes = True

# Estadísticas
class EstadisticasUsuario(BaseModel):
    total_pomodoros: int
    tiempo_total_minutos: int
    racha_dias: int
    notas_totales: int
    publicaciones: int
    logros_desbloqueados: int
