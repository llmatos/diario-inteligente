import asyncio
from pymongo import AsyncMongoClient
import os
from dotenv import load_dotenv

load_dotenv()


client = AsyncMongoClient(os.getenv("NOSQL_DATABASE_URL"))

db = client.get_database("diario_inteligente")

collection_registros = db.get_collection("registro")