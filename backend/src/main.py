import uvicorn
from fastapi import FastAPI, HTTPException, File, Depends, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
from sqlalchemy import select
import uuid
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware


from src.schemas.usuario_schemas import UsuarioRead, UsuarioUpdate
from src.models.usuarios import Usuario
from src.services.auth import auth_backend, current_active_user, fastapi_users
from src.database import create_db_and_tables, get_async_session, Base
from src.routers import registro_routes
from src.routers import usuario_routes
from src.routers import vinculos_routes

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost",
    "http://localhost:8081", #porta Expo/React Native
    "http://127.0.0.1:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

@app.get("/")
async def root():
    return {"message": "CORS configurado com sucesso!"}

app.include_router(fastapi_users.get_auth_router(auth_backend), prefix='/auth/jwt', tags=["auth"])
# app.include_router(fastapi_users.get_register_router(UsuarioRead, UsuarioCreate), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_reset_password_router(), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_verify_router(UsuarioRead), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_users_router(UsuarioRead, UsuarioUpdate), prefix="/users", tags=["users"])

app.include_router(usuario_routes.router)

app.include_router(registro_routes.router)

app.include_router(vinculos_routes.router)



if __name__ == "__main__":
    uvicorn.run("src.main:app", host="localhost", port=8000, reload=True)
