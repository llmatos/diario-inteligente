import uuid
from typing import Optional, Any
from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin, models
from fastapi_users.authentication import (
    AuthenticationBackend, BearerTransport, JWTStrategy
)
from fastapi_users.db import SQLAlchemyUserDatabase
from src.models.usuarios import Usuario, get_user_db
import os
from dotenv import load_dotenv

load_dotenv()

secret = os.getenv("JWT_SECRET")

class UserManager(UUIDIDMixin, BaseUserManager[Usuario, uuid.UUID]):
    reset_password_token_secret = secret
    verification_token_secret = secret

    async def on_after_register(self, user, request = None):
        return await super().on_after_register(user, request)
    async def on_after_forgot_password(self, user, token, request = None):
        return await super().on_after_forgot_password(user, token, request)
    async def on_after_request_verify(self, user, token, request = None):
        return await super().on_after_request_verify(user, token, request)
    
async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)

bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

def get_jwt_strategy():
    return JWTStrategy(secret=secret, lifetime_seconds=1000)

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[Usuario, uuid.UUID](get_user_manager, [auth_backend])
current_active_user = fastapi_users.current_user(active=True)
