"""
Modelos SQLAlchemy basados en schema_v3_brainhub.sql
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Enum, JSON, Date, BIGINT, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid as uuid_pkg
from datetime import datetime
from enum import Enum as PyEnum
from app.db.database import Base


# ═══════════════════════════════════════════════════
# ENUMS
# ═══════════════════════════════════════════════════

class ModoPomodoro(str, PyEnum):
    WORK = "work"
    SHORT = "short"
    LONG = "long"


class EstadoSesion(str, PyEnum):
    ACTIVA = "activa"
    COMPLETADA = "completada"
    CANCELADA = "cancelada"


class RolMensaje(str, PyEnum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class EstadoPublicacion(str, PyEnum):
    ACTIVA = "activa"
    ELIMINADA = "eliminada"
    REPORTADA = "reportada"


# ═══════════════════════════════════════════════════
# 1. USUARIOS
# ═══════════════════════════════════════════════════

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    apodo = Column(String(24), unique=True, nullable=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    plan_id = Column(Integer, ForeignKey("cat_plan.id"), default=1)
    activo = Column(Boolean, default=True, nullable=False)
    email_verificado = Column(Boolean, default=False, nullable=False)
    ultimo_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    config_pomodoro = relationship("ConfigPomodoro", back_populates="usuario", uselist=False)
    sesiones = relationship("SesionPomodoro", back_populates="usuario")
    estadisticas = relationship("EstadisticaDiaria", back_populates="usuario")
    racha = relationship("RachaUsuario", back_populates="usuario", uselist=False)
    notas = relationship("Nota", back_populates="usuario")
    chats_ia = relationship("ChatIA", back_populates="usuario")
    publicaciones = relationship("Publicacion", back_populates="usuario")
    logros = relationship("UsuarioLogro", back_populates="usuario")


# ═══════════════════════════════════════════════════
# 2. PLANES
# ═══════════════════════════════════════════════════

class CatPlan(Base):
    __tablename__ = "cat_plan"
    
    id = Column(Integer, primary_key=True)
    codigo = Column(String(30), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    precio_cop = Column(Integer, default=0, nullable=False)
    descripcion = Column(Text, nullable=True)
    activo = Column(Boolean, default=True, nullable=False)


# ═══════════════════════════════════════════════════
# 3. CONFIGURACIÓN POMODORO
# ═══════════════════════════════════════════════════

class ConfigPomodoro(Base):
    __tablename__ = "config_pomodoro"
    
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), primary_key=True)
    duracion_trabajo_min = Column(Integer, default=25, nullable=False)
    descanso_corto_min = Column(Integer, default=5, nullable=False)
    descanso_largo_min = Column(Integer, default=15, nullable=False)
    ciclos_antes_largo = Column(Integer, default=4, nullable=False)
    meta_diaria = Column(Integer, default=8, nullable=False)
    sonido_activo = Column(Boolean, default=True, nullable=False)
    auto_iniciar = Column(Boolean, default=False, nullable=False)
    
    # Relación
    usuario = relationship("Usuario", back_populates="config_pomodoro")


# ═══════════════════════════════════════════════════
# 4. SESIONES POMODORO
# ═══════════════════════════════════════════════════

class SesionPomodoro(Base):
    __tablename__ = "sesiones_pomodoro"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    modo = Column(Enum(ModoPomodoro), nullable=False)
    estado = Column(Enum(EstadoSesion), default=EstadoSesion.ACTIVA, nullable=False)
    duracion_min = Column(Integer, nullable=False)
    inicio = Column(DateTime, default=datetime.utcnow, nullable=False)
    fin = Column(DateTime, nullable=True)
    
    # Relación
    usuario = relationship("Usuario", back_populates="sesiones")


# ═══════════════════════════════════════════════════
# 5. ESTADÍSTICAS DIARIAS
# ═══════════════════════════════════════════════════

class EstadisticaDiaria(Base):
    __tablename__ = "estadisticas_diarias"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    fecha = Column(Date, nullable=False)
    pomodoros_completados = Column(Integer, default=0, nullable=False)
    minutos_enfocados = Column(Integer, default=0, nullable=False)
    tareas_completadas = Column(Integer, default=0, nullable=False)
    meta_alcanzada = Column(Boolean, default=False, nullable=False)
    distribucion_horas = Column(JSON, nullable=True)
    
    __table_args__ = (UniqueConstraint('usuario_id', 'fecha'),)
    
    # Relación
    usuario = relationship("Usuario", back_populates="estadisticas")


# ═══════════════════════════════════════════════════
# 6. RACHA DE USUARIO
# ═══════════════════════════════════════════════════

class RachaUsuario(Base):
    __tablename__ = "racha_usuario"
    
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), primary_key=True)
    racha_actual = Column(Integer, default=0, nullable=False)
    racha_maxima = Column(Integer, default=0, nullable=False)
    ultima_actividad = Column(Date, nullable=True)
    
    # Relación
    usuario = relationship("Usuario", back_populates="racha")


# ═══════════════════════════════════════════════════
# 7. ETIQUETAS DE NOTAS
# ═══════════════════════════════════════════════════

class CatEtiquetaNota(Base):
    __tablename__ = "cat_etiqueta_nota"
    
    id = Column(Integer, primary_key=True)
    codigo = Column(String(30), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)


# ═══════════════════════════════════════════════════
# 8. NOTAS
# ═══════════════════════════════════════════════════

class Nota(Base):
    __tablename__ = "notas"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    etiqueta_id = Column(Integer, ForeignKey("cat_etiqueta_nota.id", ondelete="SET NULL"), nullable=True)
    contenido = Column(Text, nullable=False)
    completada = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relación
    usuario = relationship("Usuario", back_populates="notas")


# ═══════════════════════════════════════════════════
# 9. CHAT IA (ORION)
# ═══════════════════════════════════════════════════

class ChatIA(Base):
    __tablename__ = "chats_ia"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    titulo = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    usuario = relationship("Usuario", back_populates="chats_ia")
    mensajes = relationship("MensajeChat", back_populates="chat")


class MensajeChat(Base):
    __tablename__ = "mensajes_chat"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    chat_id = Column(UUID(as_uuid=True), ForeignKey("chats_ia.id", ondelete="CASCADE"), nullable=False)
    rol = Column(Enum(RolMensaje), nullable=False)
    contenido = Column(Text, nullable=False)
    modelo_ia = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relación
    chat = relationship("ChatIA", back_populates="mensajes")


# ═══════════════════════════════════════════════════
# 10. CATEGORÍAS DE PUBLICACIONES
# ═══════════════════════════════════════════════════

class CatCategoriaPost(Base):
    __tablename__ = "cat_categoria_post"
    
    id = Column(Integer, primary_key=True)
    codigo = Column(String(30), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    emoji = Column(String(10), nullable=True)
    activo = Column(Boolean, default=True, nullable=False)


# ═══════════════════════════════════════════════════
# 11. PUBLICACIONES (COMUNIDAD)
# ═══════════════════════════════════════════════════

class Publicacion(Base):
    __tablename__ = "publicaciones"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    categoria_id = Column(Integer, ForeignKey("cat_categoria_post.id"), nullable=False)
    nick = Column(String(24), nullable=False)
    titulo = Column(String(80), nullable=False)
    cuerpo = Column(String(500), nullable=False)
    estado = Column(Enum(EstadoPublicacion), default=EstadoPublicacion.ACTIVA, nullable=False)
    likes = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relación
    usuario = relationship("Usuario", back_populates="publicaciones")


# ═══════════════════════════════════════════════════
# 12. LEADERBOARD
# ═══════════════════════════════════════════════════

class Leaderboard(Base):
    __tablename__ = "leaderboard"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    nick = Column(String(24), nullable=False)
    pomodoros_totales = Column(Integer, default=0, nullable=False)
    semana = Column(Date, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    __table_args__ = (UniqueConstraint('usuario_id', 'semana'),)


# ═══════════════════════════════════════════════════
# 13. LOGROS
# ═══════════════════════════════════════════════════

class CatLogro(Base):
    __tablename__ = "cat_logro"
    
    id = Column(Integer, primary_key=True)
    codigo = Column(String(50), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    emoji = Column(String(10), nullable=True)
    condicion = Column(JSON, nullable=True)
    activo = Column(Boolean, default=True, nullable=False)


class UsuarioLogro(Base):
    __tablename__ = "usuario_logros"
    
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), primary_key=True)
    logro_id = Column(Integer, ForeignKey("cat_logro.id"), primary_key=True)
    desbloqueado_en = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relación
    usuario = relationship("Usuario", back_populates="logros")
