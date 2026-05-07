from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from uuid import UUID

from database import get_db
from models import Usuario, SesionPomodoro, EstadoSesion
from schemas import SesionPomodoroCreate, SesionPomodoroUpdate, SesionPomodoroResponse
from security import get_current_user

router = APIRouter(prefix="/api/pomodoro", tags=["pomodoro"])

@router.post("/sesiones", response_model=SesionPomodoroResponse)
def crear_sesion(
    sesion_data: SesionPomodoroCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    nueva_sesion = SesionPomodoro(
        usuario_id=current_user.id,
        modo=sesion_data.modo,
        duracion_minutos=sesion_data.duracion_minutos
    )

    db.add(nueva_sesion)
    db.commit()
    db.refresh(nueva_sesion)

    return nueva_sesion

@router.get("/sesiones", response_model=list[SesionPomodoroResponse])
def listar_sesiones(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    limite: int = 10
):
    sesiones = db.query(SesionPomodoro)\
        .filter(SesionPomodoro.usuario_id == current_user.id)\
        .order_by(SesionPomodoro.created_at.desc())\
        .limit(limite)\
        .all()

    return sesiones

@router.get("/sesiones/{sesion_id}", response_model=SesionPomodoroResponse)
def obtener_sesion(
    sesion_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    sesion = db.query(SesionPomodoro)\
        .filter(SesionPomodoro.id == sesion_id)\
        .filter(SesionPomodoro.usuario_id == current_user.id)\
        .first()

    if not sesion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesión no encontrada")

    return sesion

@router.put("/sesiones/{sesion_id}", response_model=SesionPomodoroResponse)
def actualizar_sesion(
    sesion_id: UUID,
    actualizacion: SesionPomodoroUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    sesion = db.query(SesionPomodoro)\
        .filter(SesionPomodoro.id == sesion_id)\
        .filter(SesionPomodoro.usuario_id == current_user.id)\
        .first()

    if not sesion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesión no encontrada")

    if actualizacion.estado:
        sesion.estado = actualizacion.estado
        if actualizacion.estado == EstadoSesion.completada:
            sesion.finalizado_at = datetime.utcnow()

    if actualizacion.tiempo_transcurrido is not None:
        sesion.tiempo_transcurrido = actualizacion.tiempo_transcurrido

    db.commit()
    db.refresh(sesion)

    return sesion

@router.delete("/sesiones/{sesion_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_sesion(
    sesion_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    sesion = db.query(SesionPomodoro)\
        .filter(SesionPomodoro.id == sesion_id)\
        .filter(SesionPomodoro.usuario_id == current_user.id)\
        .first()

    if not sesion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesión no encontrada")

    db.delete(sesion)
    db.commit()

    return None
