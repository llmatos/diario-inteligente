from bson import ObjectId

from src.nosql import db, collection_registros
from typing import Optional
from fastapi import Depends, HTTPException, Request
from src.models.usuarios import Usuario, get_user_db, AcessoRegistro
from src.models.registros import Registro
from src.services.ai_service import analyze_sentiment, summarize_text
from src.services.auth import current_active_user
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_async_session


async def criar_registro(
    conteudo: str, 
    usuario_id,
    session):
    try:
        sentimento = await analyze_sentiment(conteudo)
        resumo = await summarize_text(conteudo)
        registro_mg = {
            "conteudo": conteudo,
            "resumo": resumo
        }
        inserted_doc = await collection_registros.insert_one(registro_mg)
        
        
        registro = Registro(
            paciente_id = usuario_id, 
            sentimento = sentimento,
            mongo_doc_id = str(inserted_doc.inserted_id),
        )

        session.add(registro)
        await session.commit()
        await session.refresh(registro)
        return registro
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def buscar_registros(usuario_id, session):
    
    query = select(Registro).where(Registro.paciente_id == usuario_id)
    result_postgres = await session.execute(query)
    registros_sql = result_postgres.scalars().all()
   
    if not registros_sql:
        return []

    ids_mongo = [ObjectId(reg.mongo_doc_id) for reg in registros_sql]

    cursor = collection_registros.find({"_id": {"$in": ids_mongo}})
    docs_mongo = await cursor.to_list(length=len(ids_mongo))


    conteudos_map = {
        str(doc["_id"]): {
            "resumo": doc.get("resumo", "Resumo indisponível"),
            "conteudo": doc.get("conteudo", "Texto original indisponível")
        } 
        for doc in docs_mongo
    }

    registros_completos = []
    for reg in registros_sql:
        conteudo_mongo = conteudos_map.get(reg.mongo_doc_id, {})
        
        registros_completos.append({
            "id": str(reg.id),
            "sentimento": reg.sentimento,
            "data_criacao": reg.data_criacao.isoformat(),
            "resumo": conteudo_mongo.get("resumo", "Resumo não encontrado"),
            "relato": conteudo_mongo.get("conteudo", "Relato não encontrado") 
        })

    return registros_completos


async def deletar_registro(registro_id: str, usuario_id, session: AsyncSession):
    
    query = select(Registro).where(Registro.id == registro_id, Registro.paciente_id == usuario_id)
    result = await session.execute(query)
    registro = result.scalar_one_or_none()
    
    if not registro:
        raise HTTPException(status_code=404, detail="Registro não encontrado ou acesso não autorizado.")

    
    if registro.mongo_doc_id:
        try:
            await collection_registros.delete_one({"_id": ObjectId(registro.mongo_doc_id)})
        except Exception as e:
            print(f"Aviso: Falha ao deletar no MongoDB: {e}")

    
    await session.delete(registro)
    await session.commit()
    return True

async def buscar_registros_compartilhados(paciente_id, psicologo_id, session):
   
    query = select(Registro).join(AcessoRegistro, Registro.id == AcessoRegistro.registro_id).where(
        Registro.paciente_id == paciente_id,
        AcessoRegistro.psicologo_id == psicologo_id
    )
    result_postgres = await session.execute(query)
    registros_sql = result_postgres.scalars().all()
   
    if not registros_sql:
        return []

    ids_mongo = [ObjectId(reg.mongo_doc_id) for reg in registros_sql]
    cursor = collection_registros.find({"_id": {"$in": ids_mongo}})
    docs_mongo = await cursor.to_list(length=len(ids_mongo))

    conteudos_map = {
        str(doc["_id"]): {
            "resumo": doc.get("resumo", "Resumo indisponível"),
            "conteudo": doc.get("conteudo", "Texto original indisponível")
        } 
        for doc in docs_mongo
    }

    registros_completos = []
    for reg in registros_sql:
        conteudo_mongo = conteudos_map.get(reg.mongo_doc_id, {})
        registros_completos.append({
            "id": str(reg.id),
            "sentimento": reg.sentimento,
            "data_criacao": reg.data_criacao.isoformat(),
            "resumo": conteudo_mongo.get("resumo", "Resumo não encontrado"),
            "relato": conteudo_mongo.get("conteudo", "Relato não encontrado") 
        })

    return registros_completos