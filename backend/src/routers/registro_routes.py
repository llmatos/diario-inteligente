from fastapi import APIRouter, Depends, Form, HTTPException
from src.models.usuarios import Usuario
from sqlalchemy.future import select
from src.models.registros import Registro
from src.services.registro_service import criar_registro, buscar_registros, deletar_registro, buscar_registros_compartilhados
from sqlalchemy.ext.asyncio import AsyncSession
from src.services.auth_service import current_active_user
from src.database import get_async_session

router = APIRouter(
    prefix="/registros",
    tags=["Registros do Diário"]
)


@router.post("/", status_code=201)
async def criar_novo_registro(
    conteudo: str = Form(""),
    usuario: Usuario = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)):
    resultado = await criar_registro(conteudo, usuario.id, session)
    return {"mensagem": "Rota de criação funcionando!",
            "registro": resultado}

@router.get("/listar_registros")
async def listar_registros(
    usuario: Usuario = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)):
    resultado = await buscar_registros(usuario.id, session)
    return {"registros": resultado}

@router.get("/{id}")
async def buscar_registro_id(id: str):
    return {"mensagem": f"Buscando registro ${id}"}


@router.delete("/{id}", status_code=200)
async def apagar_registro_por_id(
    id: str,
    usuario: Usuario = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)):
    await deletar_registro(id, usuario.id, session)
    return {"mensagem": "Registro removido com sucesso de todas as bases de dados!"}

@router.get("/compartilhados/{paciente_id}")
async def listar_registros_compartilhados(
    paciente_id: str,
    usuario: Usuario = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    if usuario.tipo_usuario != "psicologo":
        raise HTTPException(status_code=403, detail="Acesso restrito a psicólogos.")
        
    resultado = await buscar_registros_compartilhados(paciente_id, usuario.id, session)
    return {"registros": resultado}

@router.get("/panorama_paciente/{paciente_id}")
async def panorama_paciente(
    paciente_id: str,
    usuario: Usuario = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    if usuario.tipo_usuario != "psicologo":
        raise HTTPException(status_code=403, detail="Acesso restrito a psicólogos.")
    
    # Busca apenas id, sentimento e data (sem o texto)
    query = select(Registro.id, Registro.sentimento, Registro.data_criacao).where(
        Registro.paciente_id == paciente_id
    )
    result = await session.execute(query)
    registros = result.all()
    
    panorama = []
    for reg in registros:
        panorama.append({
            "id": str(reg.id),
            "sentimento": reg.sentimento,
            "data_criacao": reg.data_criacao.isoformat()
        })
        
    return {"registros": panorama}