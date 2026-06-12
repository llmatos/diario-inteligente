from typing import Optional

from pydantic import BaseModel


class RegistroCreate(BaseModel):
    conteudo: str


class RegistroRead(BaseModel):
    resumo: str

class RegistroDelete(BaseModel):
    pass
