import uuid
from typing import Optional
from pydantic import BaseModel, Field
from fastapi_users import schemas


class UsuarioRead(schemas.BaseUser[uuid.UUID]):
    nome: str
    cpf: str
    telefone: Optional[str] = None
    tipo_usuario: str


class PacienteCreate(schemas.BaseUserCreate):
    nome: str
    cpf: str = Field(..., max_length=20, description="CPF do paciente")
    telefone: Optional[str] = Field(None, max_length=20)

class PsicologoCreate(schemas.BaseUserCreate):
    nome: str
    cpf: str = Field(..., max_length=20, description="CPF do psicólogo")
    telefone: Optional[str] = Field(None, max_length=20)
    crp: str = Field(..., max_length=10, description="Registro do CRP (Obrigatório)")
    

class UsuarioUpdate(schemas.BaseUserUpdate):
    nome: Optional[str] = None    
    telefone: Optional[str] = None
    email: Optional[str] = None

class PasswordChangeRequest(BaseModel):
    senha_atual: str
    nova_senha: str