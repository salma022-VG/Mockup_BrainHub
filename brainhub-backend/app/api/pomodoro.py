"""
Endpoints de Pomodoro
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from uuid import UUID
from app.db.database import get_db
from app.models.models import (
    ConfigPomodoro, SesionPomodoro, EstadisticaDiaria, 
    RachaUsuario, ModoPomodoro, EstadoSesion
)
from app.schemas.schemas import (
    ConfigPomodoroResponse, SesionPomodoroCreate, SesionPomodoroResponse,
    EstadisticaResponse
)
from app.core.security import get_current_user

router = APIRouter(prefix="/pomodoro", tags=["Pomodoro"])


@router.get("/config", response_model=ConfigPomodoroResponse)
def get_config(
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene la configuración de Pomodoro del usuario
    """
    config = db.query(ConfigPomodoro).filter(
        ConfigPomodoro.usuario_id == current_user_id
    ).first()
    
    if not config:
        # Crear config por defecto
        config = ConfigPomodoro(usuario_id=current_user_id)
        db.add(config)
        db.commit()
        db.refresh(config)
    
    return config


@router.put("/config")
def update_config(
    updates: dict,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza la configuración de Pomodoro
    """
    config = db.query(ConfigPomodoro).filter(
        ConfigPomodoro.usuario_id == current_user_id
    ).first()
    
    if not config:
        config = ConfigPomodoro(usuario_id=current_user_id)
        db.add(config)
    
    for key, value in updates.items():
        if hasattr(config, key):
            setattr(config, key, value)
    
    db.commit()
    db.refresh(config)
    return config


@router.post("/sesiones", response_model=SesionPomodoroResponse)
def crear_sesion(
    sesion_data: SesionPomodoroCreate,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crea una nueva sesión de Pomodoro
    """
    new_sesion = SesionPomodoro(
        usuario_id=current_user_id,
        modo=ModoPomodoro(sesion_data.modo),
        duracion_min=sesion_data.duracion_min,
        estado=EstadoSesion.ACTIVA
    )
    
    db.add(new_sesion)
    db.commit()
    db.refresh(new_sesion)
    
    return new_sesion


@router.get("/sesiones", response_model=list[SesionPomodoroResponse])
def listar_sesiones(
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista todas las sesiones del usuario
    """
    sesiones = db.query(SesionPomodoro).filter(
        SesionPomodoro.usuario_id == current_user_id
    ).order_by(SesionPomodoro.inicio.desc()).all()
    
    return sesiones


@router.put("/sesiones/{sesion_id}/completar")
def completar_sesion(
    sesion_id: str,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Marca una sesión como completada
    """
    sesion = db.query(SesionPomodoro).filter(
        SesionPomodoro.id == sesion_id,
        SesionPomodoro.usuario_id == current_user_id
    ).first()
    
    if not sesion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    sesion.estado = EstadoSesion.COMPLETADA
    sesion.fin = datetime.utcnow()
    
    db.commit()
    db.refresh(sesion)
    
    return sesion


@router.get("/estadisticas", response_model=list[EstadisticaResponse])
def get_estadisticas(
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene las estadísticas del usuario (últimos 30 días)
    """
    from datetime import date, timedelta
    
    start_date = date.today() - timedelta(days=30)
    
    estadisticas = db.query(EstadisticaDiaria).filter(
        EstadisticaDiaria.usuario_id == current_user_id,
        EstadisticaDiaria.fecha >= start_date
    ).order_by(EstadisticaDiaria.fecha.desc()).all()
    
    return estadisticas
