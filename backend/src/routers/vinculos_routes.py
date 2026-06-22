from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, delete

from src.database import get_async_session
from src.models.usuarios import Usuario, Psicologo, Paciente, Vinculo, AcessoRegistro
from src.models.registros import Registro
from src.services.auth_service import current_active_user

router = APIRouter(prefix="/vinculos", tags=["Vínculos e Compartilhamento"])


class VinculoCreate(BaseModel):
    crp_psicologo: str


@router.post("/conectar", status_code=status.HTTP_201_CREATED)
async def criar_vinculo(
    payload: VinculoCreate,
    usuario: Usuario = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    if usuario.tipo_usuario != "paciente":
        raise HTTPException(status_code=403, detail="Apenas pacientes podem solicitar vínculos.")

    
    query_psicologo = select(Psicologo).where(Psicologo.crp == payload.crp_psicologo)
    result_psicologo = await session.execute(query_psicologo)
    psicologo = result_psicologo.scalar_one_or_none()

    if not psicologo:
        raise HTTPException(status_code=404, detail="Psicólogo não encontrado com o CRP informado.")

    
    query_vinculo = select(Vinculo).where(
        Vinculo.paciente_id == usuario.id,
        Vinculo.psicologo_id == psicologo.id
    )
    result_vinculo = await session.execute(query_vinculo)
    vinculo_existente = result_vinculo.scalar_one_or_none()
    
    if vinculo_existente:
        raise HTTPException(
            status_code=400, 
            detail=f"Você já possui uma solicitação com este profissional (Status: {vinculo_existente.status})."
        )


    novo_vinculo = Vinculo(
        paciente_id=usuario.id,
        psicologo_id=psicologo.id,
        status="pendente" 
    )
    
    session.add(novo_vinculo)
    await session.commit()
    
    return {"mensagem": f"Solicitação enviada ao Dr(a). {psicologo.nome}. Aguarde a aprovação."}



@router.get("/pendentes")
async def listar_pendentes(
    usuario: Usuario = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    if usuario.tipo_usuario != "psicologo":
        raise HTTPException(status_code=403, detail="Acesso restrito a psicólogos.")

   
    query = select(Vinculo, Paciente).join(Paciente, Vinculo.paciente_id == Paciente.id).where(
        Vinculo.psicologo_id == usuario.id,
        Vinculo.status == "pendente"
    )
    result = await session.execute(query)
    
    pendentes = []
    for vinculo, paciente in result.all():
        pendentes.append({
            "vinculo_id": str(vinculo.id),
            "paciente_nome": paciente.nome,
            "data_solicitacao": vinculo.data_vinculo
        })

    return {"pendentes": pendentes}



@router.patch("/{vinculo_id}/aceitar")
async def aceitar_vinculo(
    vinculo_id: str,
    usuario: Usuario = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    if usuario.tipo_usuario != "psicologo":
        raise HTTPException(status_code=403, detail="Acesso restrito a psicólogos.")

    query = select(Vinculo).where(
        Vinculo.id == vinculo_id, 
        Vinculo.psicologo_id == usuario.id
    )
    result = await session.execute(query)
    vinculo = result.scalar_one_or_none()

    if not vinculo:
        raise HTTPException(status_code=404, detail="Solicitação de vínculo não encontrada.")


    vinculo.status = "ativo"
    await session.commit()
    
    return {"mensagem": "Vínculo ativado. Agora o paciente pode compartilhar registros com você."}



@router.delete("/{vinculo_id}")
async def romper_vinculo(
    vinculo_id: str,
    usuario: Usuario = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
  
    query = select(Vinculo).where(
        Vinculo.id == vinculo_id,
        or_(Vinculo.paciente_id == usuario.id, Vinculo.psicologo_id == usuario.id)
    )
    result = await session.execute(query)
    vinculo = result.scalar_one_or_none()

    if not vinculo:
        raise HTTPException(status_code=404, detail="Vínculo não encontrado ou acesso negado.")
    
    query_limpeza = delete(AcessoRegistro).where(
        AcessoRegistro.paciente_id == vinculo.paciente_id,
        AcessoRegistro.psicologo_id == vinculo.psicologo_id
    )
    await session.execute(query_limpeza)

    await session.delete(vinculo)
    await session.commit()
    
    return {"mensagem": "O vínculo foi desfeito com sucesso."}



@router.post("/compartilhar/{registro_id}")
async def compartilhar_registro(
    registro_id: str,
    usuario: Usuario = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    if usuario.tipo_usuario != "paciente":
        raise HTTPException(status_code=403, detail="Apenas pacientes podem compartilhar relatos.")

    query_registro = select(Registro).where(
        Registro.id == registro_id, 
        Registro.paciente_id == usuario.id
    )
    registro = (await session.execute(query_registro)).scalar_one_or_none()

    if not registro:
        raise HTTPException(status_code=404, detail="Registro não encontrado.")

  
    query_vinculo = select(Vinculo).where(
        Vinculo.paciente_id == usuario.id, 
        Vinculo.status == "ativo"
    )
    vinculo = (await session.execute(query_vinculo)).scalar_one_or_none()

    if not vinculo:
        raise HTTPException(status_code=400, detail="Você precisa de um vínculo ATIVO com um psicólogo para compartilhar.")

    query_acesso = select(AcessoRegistro).where(
        AcessoRegistro.registro_id == registro_id,
        AcessoRegistro.psicologo_id == vinculo.psicologo_id
    )
    
    if (await session.execute(query_acesso)).scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Este relato já está compartilhado com o seu terapeuta.")

    novo_acesso = AcessoRegistro(
        paciente_id=usuario.id,
        psicologo_id=vinculo.psicologo_id,
        registro_id=registro.id
    )

    session.add(novo_acesso)
    await session.commit()

    return {"mensagem": "O relato foi compartilhado com segurança."}

@router.get("/ativos")
async def listar_pacientes_ativos(
    usuario: Usuario = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    if usuario.tipo_usuario != "psicologo":
        raise HTTPException(status_code=403, detail="Acesso restrito a psicólogos.")

    query = select(Vinculo, Paciente).join(Paciente, Vinculo.paciente_id == Paciente.id).where(
        Vinculo.psicologo_id == usuario.id,
        Vinculo.status == "ativo"
    )
    result = await session.execute(query)
    
    pacientes = []
    for vinculo, paciente in result.all():
        pacientes.append({
            "vinculo_id": str(vinculo.id),
            "paciente_id": str(paciente.id),
            "paciente_nome": paciente.nome,
            "data_vinculo": vinculo.data_vinculo
        })

    return {"pacientes": pacientes}

@router.get("/meu-vinculo")
async def get_meu_vinculo(
    usuario: Usuario = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    query = select(Vinculo, Psicologo).join(Psicologo, Vinculo.psicologo_id == Psicologo.id).where(
        Vinculo.paciente_id == usuario.id,
        Vinculo.status == "ativo"
    )
    result = await session.execute(query)
    data = result.first()
    if not data:
        return {}
    vinculo, psicologo = data
    return {"vinculo_id": str(vinculo.id), "psicologo_nome": psicologo.nome, "psicologo_crp": psicologo.crp}

@router.get("/me")
async def get_usuario_logado(usuario: Usuario = Depends(current_active_user)):
    return {"tipo_usuario": usuario.tipo_usuario}

@router.delete("/compartilhar/{registro_id}")
async def remover_compartilhamento(
    registro_id: str,
    usuario: Usuario = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    if usuario.tipo_usuario != "paciente":
        raise HTTPException(status_code=403, detail="Apenas pacientes podem alterar acessos.")

   
    query = select(AcessoRegistro).where(
        AcessoRegistro.registro_id == registro_id,
        AcessoRegistro.paciente_id == usuario.id
    )
    result = await session.execute(query)
    acesso = result.scalar_one_or_none()

    if not acesso:
        raise HTTPException(status_code=404, detail="Este relato não está compartilhado.")

    
    await session.delete(acesso)
    await session.commit()

    return {"mensagem": "O relato voltou a ser privado."}