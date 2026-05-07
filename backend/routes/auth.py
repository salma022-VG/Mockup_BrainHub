from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from database import get_db
from models import Usuario
from schemas import UsuarioLogin, UsuarioRegistro, TokenResponse, UsuarioResponse
from security import hash_password, verify_password, create_access_token
from config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/registro", response_model=UsuarioResponse)
def registro(usuario_data: UsuarioRegistro, db: Session = Depends(get_db)):
    # Verificar si el usuario ya existe
    existing_user = db.query(Usuario).filter(Usuario.email == usuario_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )

    # Crear nuevo usuario
    nuevo_usuario = Usuario(
        nombre=usuario_data.nombre,
        apellido=usuario_data.apellido,
        email=usuario_data.email,
        password_hash=hash_password(usuario_data.password),
        plan_id=1  # Plan gratis por defecto
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return nuevo_usuario

@router.post("/login", response_model=TokenResponse)
def login(credenciales: UsuarioLogin, db: Session = Depends(get_db)):
    # Buscar usuario
    usuario = db.query(Usuario).filter(Usuario.email == credenciales.email).first()

    if not usuario or not verify_password(credenciales.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña inválidos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Crear token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(usuario.id)},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UsuarioResponse)
def get_current_user_info(current_user: Usuario = Depends(get_current_user)):
    return current_user
