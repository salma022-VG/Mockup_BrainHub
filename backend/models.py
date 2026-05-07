from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, JSON, ForeignKey, SmallInteger, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from database import Base

class ModoPomodoro(str, enum.Enum):
    work = "work"
    short = "short"
    long = "long"

class EstadoSesion(str, enum.Enum):
    activa = "activa"
    completada = "completada"
    cancelada = "cancelada"

class RolMensaje(str, enum.Enum):
    user = "user"
    assistant = "assistant"
    system = "system"

class EstadoPublicacion(str, enum.Enum):
    activa = "activa"
    eliminada = "eliminada"
    reportada = "reportada"

# Catálogos
class CatPlan(Base):
    __tablename__ = "cat_plan"
    id = Column(SmallInteger, primary_key=True)
    codigo = Column(String(30), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    precio_cop = Column(Integer, default=0)
    descripcion = Column(Text)
    activo = Column(Boolean, default=True)

class CatCategoriaPost(Base):
    __tablename__ = "cat_categoria_post"
    id = Column(SmallInteger, primary_key=True)
    codigo = Column(String(30), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    emoji = Column(String(10))
    activo = Column(Boolean, default=True)

class CatEtiquetaNota(Base):
    __tablename__ = "cat_etiqueta_nota"
    id = Column(SmallInteger, primary_key=True)
    codigo = Column(String(30), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    activo = Column(Boolean, default=True)

class CatLogro(Base):
    __tablename__ = "cat_logro"
    id = Column(SmallInteger, primary_key=True)
    codigo = Column(String(50), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    emoji = Column(String(10))
    condicion = Column(JSON)
    activo = Column(Boolean, default=True)

# Usuarios
class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    apodo = Column(String(24), unique=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    plan_id = Column(SmallInteger, ForeignKey("cat_plan.id"), default=1)
    activo = Column(Boolean, default=True)
    email_verificado = Column(Boolean, default=False)
    ultimo_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

# Sesiones Pomodoro
class SesionPomodoro(Base):
    __tablename__ = "sesiones_pomodoro"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    modo = Column(Enum(ModoPomodoro), nullable=False)
    duracion_minutos = Column(Integer, nullable=False)
    estado = Column(Enum(EstadoSesion), default=EstadoSesion.activa)
    tiempo_transcurrido = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    finalizado_at = Column(DateTime(timezone=True))

# Notas
class Nota(Base):
    __tablename__ = "notas"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    titulo = Column(String(255), nullable=False)
    contenido = Column(Text)
    etiqueta_id = Column(SmallInteger, ForeignKey("cat_etiqueta_nota.id"))
    color = Column(String(7))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

# Conversaciones IA
class ConversacionIA(Base):
    __tablename__ = "conversaciones_ia"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    titulo = Column(String(255))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class MensajeIA(Base):
    __tablename__ = "mensajes_ia"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversacion_id = Column(UUID(as_uuid=True), ForeignKey("conversaciones_ia.id"), nullable=False)
    rol = Column(Enum(RolMensaje), nullable=False)
    contenido = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

# Publicaciones Comunidad
class PublicacionComunidad(Base):
    __tablename__ = "publicaciones_comunidad"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    categoria_id = Column(SmallInteger, ForeignKey("cat_categoria_post.id"), nullable=False)
    titulo = Column(String(255), nullable=False)
    contenido = Column(Text)
    estado = Column(Enum(EstadoPublicacion), default=EstadoPublicacion.activa)
    likes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

# Logros del usuario
class UsuarioLogro(Base):
    __tablename__ = "usuario_logros"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    logro_id = Column(SmallInteger, ForeignKey("cat_logro.id"), nullable=False)
    desbloqueado_at = Column(DateTime(timezone=True), default=datetime.utcnow)
