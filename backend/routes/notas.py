from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from uuid import UUID

from database import get_db
from models import Usuario, Nota
from schemas import NotaCreate, NotaUpdate, NotaResponse
from security import get_current_user

router = APIRouter(prefix="/api/notas", tags=["notas"])

@router.post("", response_model=NotaResponse)
def crear_nota(
    nota_data: NotaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    nueva_nota = Nota(
        usuario_id=current_user.id,
        titulo=nota_data.titulo,
        contenido=nota_data.contenido,
        etiqueta_id=nota_data.etiqueta_id,
        color=nota_data.color
    )

    db.add(nueva_nota)
    db.commit()
    db.refresh(nueva_nota)

    return nueva_nota

@router.get("", response_model=list[NotaResponse])
def listar_notas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    limite: int = 50
):
    notas = db.query(Nota)\
        .filter(Nota.usuario_id == current_user.id)\
        .order_by(Nota.updated_at.desc())\
        .limit(limite)\
        .all()

    return notas

@router.get("/{nota_id}", response_model=NotaResponse)
def obtener_nota(
    nota_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    nota = db.query(Nota)\
        .filter(Nota.id == nota_id)\
        .filter(Nota.usuario_id == current_user.id)\
        .first()

    if not nota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nota no encontrada")

    return nota

@router.put("/{nota_id}", response_model=NotaResponse)
def actualizar_nota(
    nota_id: UUID,
    actualizacion: NotaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    nota = db.query(Nota)\
        .filter(Nota.id == nota_id)\
        .filter(Nota.usuario_id == current_user.id)\
        .first()

    if not nota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nota no encontrada")

    if actualizacion.titulo is not None:
        nota.titulo = actualizacion.titulo
    if actualizacion.contenido is not None:
        nota.contenido = actualizacion.contenido
    if actualizacion.etiqueta_id is not None:
        nota.etiqueta_id = actualizacion.etiqueta_id
    if actualizacion.color is not None:
        nota.color = actualizacion.color

    nota.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(nota)

    return nota

@router.delete("/{nota_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_nota(
    nota_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    nota = db.query(Nota)\
        .filter(Nota.id == nota_id)\
        .filter(Nota.usuario_id == current_user.id)\
        .first()

    if not nota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nota no encontrada")

    db.delete(nota)
    db.commit()

    return None
