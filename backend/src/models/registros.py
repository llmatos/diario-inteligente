import uuid
from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.database import Base

class Registro(Base):
    __tablename__ = "registros"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)    
    paciente_id = Column(UUID(as_uuid=True), ForeignKey("pacientes.id"), nullable=False)    
    sentimento = Column(String, nullable=False)
    mongo_doc_id = Column(String, nullable=False)    
    data_criacao = Column(DateTime(timezone=True), default=lambda: datetime.now(ZoneInfo("America/Sao_Paulo")))    
    paciente = relationship("Paciente", back_populates="relatos")