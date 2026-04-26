"""
Endpoints de Chat IA (Orion)
Soporta: Claude API (Anthropic) o Falcon 7B local
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import ChatIA, MensajeChat, RolMensaje
from app.schemas.schemas import ChatIACreate, ChatIAResponse, MensajeChatCreate
from app.core.security import get_current_user
from app.core.config import settings
import requests

router = APIRouter(prefix="/ia", tags=["IA Chat"])

# Importar cliente de IA según configuración
IA_PROVIDER = settings.IA_PROVIDER  # "anthropic" o "falcon"

if IA_PROVIDER == "anthropic":
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    except ImportError:
        raise ImportError("Se requiere instalar 'anthropic' para usar Claude API")
elif IA_PROVIDER == "falcon":
    # Falcon se carga bajo demanda desde un servidor local o remoto
    FALCON_API_URL = settings.FALCON_API_URL  # ej: "http://localhost:8001"
    pass


@router.post("/chats", response_model=ChatIAResponse)
def crear_chat(
    chat_data: ChatIACreate,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crea un nuevo chat con Orion IA
    """
    new_chat = ChatIA(
        usuario_id=current_user_id,
        titulo=chat_data.titulo
    )
    
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    
    return new_chat


@router.get("/chats", response_model=list[ChatIAResponse])
def listar_chats(
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista todos los chats del usuario
    """
    chats = db.query(ChatIA).filter(
        ChatIA.usuario_id == current_user_id
    ).order_by(ChatIA.created_at.desc()).all()
    
    return chats


@router.get("/chats/{chat_id}", response_model=ChatIAResponse)
def get_chat(
    chat_id: str,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene un chat específico con todo su historial
    """
    chat = db.query(ChatIA).filter(
        ChatIA.id == chat_id,
        ChatIA.usuario_id == current_user_id
    ).first()
    
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return chat


@router.post("/chats/{chat_id}/mensajes")
async def enviar_mensaje(
    chat_id: str,
    mensaje_data: MensajeChatCreate,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Envía un mensaje al chat y obtiene respuesta de Claude
    """
    # Verificar que el chat pertenece al usuario
    chat = db.query(ChatIA).filter(
        ChatIA.id == chat_id,
        ChatIA.usuario_id == current_user_id
    ).first()
    
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    # Guardar mensaje del usuario
    user_msg = MensajeChat(
        chat_id=chat_id,
        rol=RolMensaje.USER,
        contenido=mensaje_data.contenido
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)
    
    # Obtener historial del chat para contexto
    mensajes_previos = db.query(MensajeChat).filter(
        MensajeChat.chat_id == chat_id
    ).all()
    
    # Construir mensajes para Claude
    messages = [
        {"role": msg.rol.value, "content": msg.contenido}
        for msg in mensajes_previos
    ]
    
    try:
        # Llamar a Claude API
        response = client.messages.create(
            model="claude-opus-4-1",
            max_tokens=1024,
            system="Eres Orion, asistente IA de BrainHub Studio. Eres empática, motivadora y ayudas a estudiantes con productividad, salud mental y técnicas de estudio.",
            messages=messages
        )
        
        # Extraer respuesta
        respuesta = response.content[0].text
        
        # Guardar respuesta en BD
        ai_msg = MensajeChat(
            chat_id=chat_id,
            rol=RolMensaje.ASSISTANT,
            contenido=respuesta,
            modelo_ia="claude-opus-4-1"
        )
        db.add(ai_msg)
        db.commit()
        db.refresh(ai_msg)
        
        return {
            "user_message": user_msg.dict(),
            "ai_response": ai_msg.dict()
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al llamar a Claude API: {str(e)}"
        )


@router.delete("/chats/{chat_id}")
def eliminar_chat(
    chat_id: str,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Elimina un chat completo
    """
    chat = db.query(ChatIA).filter(
        ChatIA.id == chat_id,
        ChatIA.usuario_id == current_user_id
    ).first()
    
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(chat)
    db.commit()
    
    return {"message": "Chat eliminado"}
