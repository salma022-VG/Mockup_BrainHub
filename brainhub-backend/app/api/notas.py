"""
Endpoints de Notas
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.database import get_db
from app.models.models import Nota
from app.schemas.schemas import NotaCreate, NotaUpdate, NotaResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/notas", tags=["Notas"])


@router.post("", response_model=NotaResponse)
def crear_nota(
    nota_data: NotaCreate,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crea una nueva nota
    """
    new_nota = Nota(
        usuario_id=current_user_id,
        contenido=nota_data.contenido,
        etiqueta_id=nota_data.etiqueta_id
    )
    
    db.add(new_nota)
    db.commit()
    db.refresh(new_nota)
    
    return new_nota


@router.get("", response_model=list[NotaResponse])
def listar_notas(
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista todas las notas del usuario
    """
    notas = db.query(Nota).filter(
        Nota.usuario_id == current_user_id
    ).order_by(Nota.created_at.desc()).all()
    
    return notas


@router.get("/{nota_id}", response_model=NotaResponse)
def get_nota(
    nota_id: str,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene una nota específica
    """
    nota = db.query(Nota).filter(
        Nota.id == nota_id,
        Nota.usuario_id == current_user_id
    ).first()
    
    if not nota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return nota


@router.put("/{nota_id}", response_model=NotaResponse)
def actualizar_nota(
    nota_id: str,
    nota_update: NotaUpdate,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza una nota
    """
    nota = db.query(Nota).filter(
        Nota.id == nota_id,
        Nota.usuario_id == current_user_id
    ).first()
    
    if not nota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = nota_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(nota, key, value)
    
    db.commit()
    db.refresh(nota)
    
    return nota


@router.delete("/{nota_id}")
def eliminar_nota(
    nota_id: str,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Elimina una nota
    """
    nota = db.query(Nota).filter(
        Nota.id == nota_id,
        Nota.usuario_id == current_user_id
    ).first()
    
    if not nota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(nota)
    db.commit()
    
    return {"message": "Nota eliminada"}
