"""
Endpoints de Comunidad y Publicaciones
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Publicacion, Usuario, EstadoPublicacion
from app.schemas.schemas import PublicacionCreate, PublicacionResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/comunidad", tags=["Comunidad"])


@router.post("/publicaciones", response_model=PublicacionResponse)
def crear_publicacion(
    pub_data: PublicacionCreate,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crea una nueva publicación en la comunidad
    """
    user = db.query(Usuario).filter(Usuario.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    
    new_pub = Publicacion(
        usuario_id=current_user_id,
        categoria_id=pub_data.categoria_id,
        nick=user.apodo or user.nombre,
        titulo=pub_data.titulo,
        cuerpo=pub_data.cuerpo,
        estado=EstadoPublicacion.ACTIVA
    )
    
    db.add(new_pub)
    db.commit()
    db.refresh(new_pub)
    
    return new_pub


@router.get("/publicaciones", response_model=list[PublicacionResponse])
def listar_publicaciones(
    categoria_id: int = None,
    skip: int = 0,
    limit: int = 20,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista las publicaciones de la comunidad (con filtro opcional)
    """
    query = db.query(Publicacion).filter(
        Publicacion.estado == EstadoPublicacion.ACTIVA
    )
    
    if categoria_id:
        query = query.filter(Publicacion.categoria_id == categoria_id)
    
    publicaciones = query.order_by(
        Publicacion.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return publicaciones


@router.get("/publicaciones/{pub_id}", response_model=PublicacionResponse)
def get_publicacion(
    pub_id: str,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene una publicación específica
    """
    pub = db.query(Publicacion).filter(Publicacion.id == pub_id).first()
    
    if not pub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return pub


@router.put("/publicaciones/{pub_id}/like")
def dar_like(
    pub_id: str,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Añade un like a una publicación
    """
    pub = db.query(Publicacion).filter(Publicacion.id == pub_id).first()
    
    if not pub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    # Aumentar contador de likes (simplificado, en producción usar tabla de likes)
    pub.likes += 1
    db.commit()
    db.refresh(pub)
    
    return pub


@router.delete("/publicaciones/{pub_id}")
def eliminar_publicacion(
    pub_id: str,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Elimina una publicación (solo el propietario puede)
    """
    pub = db.query(Publicacion).filter(
        Publicacion.id == pub_id,
        Publicacion.usuario_id == current_user_id
    ).first()
    
    if not pub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    pub.estado = EstadoPublicacion.ELIMINADA
    db.commit()
    
    return {"message": "Publicación eliminada"}


@router.get("/leaderboard")
def get_leaderboard(
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene el leaderboard de la semana actual
    """
    from sqlalchemy import func, desc
    from datetime import date
    
    # Obtener lunes de la semana actual
    today = date.today()
    monday = today - __import__('datetime').timedelta(days=today.weekday())
    
    leaderboard = db.query(
        Usuario.apodo or Usuario.nombre,
        func.count(Publicacion.id).label('publicaciones')
    ).join(Publicacion).filter(
        Publicacion.created_at >= monday
    ).group_by(Usuario.id).order_by(desc('publicaciones')).limit(20).all()
    
    return [
        {"nick": item[0], "publicaciones": item[1], "posicion": idx + 1}
        for idx, item in enumerate(leaderboard)
    ]
