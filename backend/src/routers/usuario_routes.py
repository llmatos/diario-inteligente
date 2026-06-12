from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import bcrypt

from src.database import get_async_session
from src.models.usuarios import Paciente, Psicologo, Usuario
from src.schemas.usuario_schemas import PacienteCreate, PsicologoCreate, UsuarioRead

router = APIRouter(prefix="/auth", tags=["Autenticação"])

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode('utf-8')




@router.post("/register/paciente", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
async def register_paciente(payload: PacienteCreate, db: AsyncSession = Depends(get_async_session)):
    
    result_email = await db.execute(select(Usuario).where(Usuario.email == payload.email))
    if result_email.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O e-mail informado já está cadastrado."
        )

 
    result_cpf = await db.execute(select(Usuario).where(Usuario.cpf == payload.cpf))
    if result_cpf.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O CPF informado já está cadastrado."
        )


    novo_paciente = Paciente(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        is_active=True,
        is_superuser=False,
        is_verified=False,
        nome=payload.nome,
        cpf=payload.cpf,
        telefone=payload.telefone,
        tipo_usuario="paciente"
    )

    db.add(novo_paciente)
    await db.commit()
    await db.refresh(novo_paciente)
    return novo_paciente

@router.post("/register/psicologo", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
async def register_psicologo(payload: PsicologoCreate, db: AsyncSession = Depends(get_async_session)):
    result_email = await db.execute(select(Usuario).where(Usuario.email == payload.email))
    if result_email.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O e-mail informado já está cadastrado."
        )

    result_cpf = await db.execute(select(Usuario).where(Usuario.cpf == payload.cpf))
    if result_cpf.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O CPF informado já está cadastrado."
        )

    result_crp = await db.execute(select(Psicologo).where(Psicologo.crp == payload.crp))
    if result_crp.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O CRP informado já está cadastrado."
        )

    novo_psicologo = Psicologo(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        is_active=True,
        is_superuser=False,
        is_verified=False,
        nome=payload.nome,
        cpf=payload.cpf,
        telefone=payload.telefone,
        crp=payload.crp,
        tipo_usuario="psicologo"
    )

    db.add(novo_psicologo)
    await db.commit()
    await db.refresh(novo_psicologo)
    return novo_psicologo