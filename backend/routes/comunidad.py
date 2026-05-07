from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from models import Usuario, PublicacionComunidad
from schemas import PublicacionComunidadCreate, PublicacionComunidadResponse
from security import get_current_user

router = APIRouter(prefix="/api/comunidad", tags=["comunidad"])

@router.post("/publicaciones", response_model=PublicacionComunidadResponse)
def crear_publicacion(
    pub_data: PublicacionComunidadCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    nueva_pub = PublicacionComunidad(
        usuario_id=current_user.id,
        categoria_id=pub_data.categoria_id,
        titulo=pub_data.titulo,
        contenido=pub_data.contenido
    )

    db.add(nueva_pub)
    db.commit()
    db.refresh(nueva_pub)

    return nueva_pub

@router.get("/publicaciones", response_model=list[PublicacionComunidadResponse])
def listar_publicaciones(
    db: Session = Depends(get_db),
    limite: int = 20,
    offset: int = 0
):
    publicaciones = db.query(PublicacionComunidad)\
        .filter(PublicacionComunidad.estado == "activa")\
        .order_by(PublicacionComunidad.created_at.desc())\
        .offset(offset)\
        .limit(limite)\
        .all()

    return publicaciones

@router.get("/publicaciones/{pub_id}", response_model=PublicacionComunidadResponse)
def obtener_publicacion(
    pub_id: UUID,
    db: Session = Depends(get_db)
):
    publicacion = db.query(PublicacionComunidad)\
        .filter(PublicacionComunidad.id == pub_id)\
        .first()

    if not publicacion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publicación no encontrada")

    return publicacion

@router.post("/publicaciones/{pub_id}/like", response_model=PublicacionComunidadResponse)
def dar_like(
    pub_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    publicacion = db.query(PublicacionComunidad)\
        .filter(PublicacionComunidad.id == pub_id)\
        .first()

    if not publicacion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publicación no encontrada")

    publicacion.likes += 1
    db.commit()
    db.refresh(publicacion)

    return publicacion

@router.delete("/publicaciones/{pub_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_publicacion(
    pub_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    publicacion = db.query(PublicacionComunidad)\
        .filter(PublicacionComunidad.id == pub_id)\
        .filter(PublicacionComunidad.usuario_id == current_user.id)\
        .first()

    if not publicacion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publicación no encontrada")

    publicacion.estado = "eliminada"
    db.commit()

    return None
