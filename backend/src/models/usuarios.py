import uuid
from datetime import datetime

from fastapi import Depends
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import relationship

from src.database import Base, get_async_session
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase


class Usuario(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "usuarios"

    nome = Column(String(200), nullable=False)
    cpf = Column(String(20), unique=True, nullable=False)
    tipo_usuario = Column(String(20), nullable=False)
    data_criacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    telefone = Column(String(20), nullable=True)

  
    __mapper_args__ = {
        "polymorphic_on": "tipo_usuario",
        "polymorphic_identity": "usuario",
    }



class Paciente(Usuario):
    __tablename__ = "pacientes"

    id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), primary_key=True)


    relatos = relationship("Registro", back_populates="paciente", cascade="all, delete-orphan")
    vinculos = relationship("Vinculo", back_populates="paciente", cascade="all, delete-orphan")
    acessos = relationship("AcessoRegistro", back_populates="paciente", cascade="all, delete-orphan")

    __mapper_args__ = {
        "polymorphic_identity": "paciente",
    }



class Psicologo(Usuario):
    __tablename__ = "psicologos"

    id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), primary_key=True)
    crp = Column(String(10), unique=True, nullable=False)

   
    vinculos = relationship("Vinculo", back_populates="psicologo", cascade="all, delete-orphan")
    acessos = relationship("AcessoRegistro", back_populates="psicologo", cascade="all, delete-orphan")

    __mapper_args__ = {
        "polymorphic_identity": "psicologo",
    }

class Vinculo(Base):
    __tablename__ = "vinculos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    paciente_id = Column(UUID(as_uuid=True), ForeignKey("pacientes.id"), nullable=False)
    psicologo_id = Column(UUID(as_uuid=True), ForeignKey("psicologos.id"), nullable=False)
    data_vinculo = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(50), nullable=False, default="pendente")

    
    paciente = relationship("Paciente", back_populates="vinculos")
    psicologo = relationship("Psicologo", back_populates="vinculos")



class AcessoRegistro(Base):
    __tablename__ = "acesso_registros"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    paciente_id = Column(UUID(as_uuid=True), ForeignKey("pacientes.id"), nullable=False)
    psicologo_id = Column(UUID(as_uuid=True), ForeignKey("psicologos.id"), nullable=False)
    registro_id = Column(UUID(as_uuid=True), ForeignKey("registros.id", ondelete="CASCADE"), nullable=False)
    data_acesso = Column(DateTime, default=datetime.utcnow, nullable=False)

  
    paciente = relationship("Paciente", back_populates="acessos")
    psicologo = relationship("Psicologo", back_populates="acessos")

async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, Usuario)