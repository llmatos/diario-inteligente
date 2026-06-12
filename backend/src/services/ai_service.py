from google import genai
import os
from dotenv import load_dotenv
import json

from uvicorn import logging

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
model = os.getenv("LLM_MODEL");

async def analyze_sentiment(text:str):
    if not text:
        return "Vazio"   
    try:
        response= await client.aio.models.generate_content(
            model=model,
            contents=f"Analise o sentimento: {text}",
            config={
                "system_instruction": """Você é um psicólogo analisando um diário. 
                Identifique o sentimento predominante do texto usando EXCLUSIVAMENTE uma das 8 emoções primárias da Roda de Plutchik: 
                Alegria, Tristeza, Raiva, Medo, Confianca, Aversao, Surpresa, Antecipacao. 
                Não use acentos nas chaves do JSON. Retorne apenas o formato JSON. Exemplo: {"sentiment": "Alegria"}""",
                "response_mime_type": "application/json",
            }
            
        )
        data = json.loads(response.text)
        return data.get("sentiment")
    except Exception as e:
        return f"Erro na análise: {str(e)}"
    

async def summarize_text(text: str):
    if not text:
        return "vazio"
    try:
        response= await client.aio.models.generate_content(
            model=model,
           contents=f"Resuma o seguinte texto: {text}",
        config={
            "system_instruction": """Você é um assistente de um diário pessoal reflexivo.
            Seu objetivo é extrair a essência do relato do usuário de forma extremamente concisa, ideal para leitura rápida em um cartão de aplicativo.

            Regras estritas:
            1. Tamanho: O resumo deve ter no máximo 2 frases curtas (idealmente entre 10 e 25 palavras). Se o texto original já for muito curto (menos de 10 palavras), apenas o reescreva com mais clareza, sem se preocupar em reduzi-lo.
            2. Foco: Capture a ação principal e a emoção central. Ignore detalhes irrelevantes ou repetitivos.
            3. Perspectiva: Escreva rigorosamente na primeira pessoa do singular ('Eu'), mantendo o tom e a personalidade original do usuário.
            4. Estilo: Vá direto ao ponto. NUNCA use introduções genéricas como 'Neste relato...', 'Hoje eu...', ou 'Eu me senti...'.

            Retorne o resultado em formato JSON usando exclusivamente a chave 'summary'.
            Exemplo de saída:
            {"summary": "Apresentei o projeto final sob muita pressão, mas o alívio que senti depois fez o esforço valer a pena."}""",
            "response_mime_type": "application/json",
        }
        )
        data = json.loads(response.text)
        return data.get("summary")
    except Exception as e:
        
        logging.error(f"Erro ao gerar resumo: {e}")
        
       
        tamanho_maximo = 80
        if len(text) <= tamanho_maximo:
            return text
            
        
        resumo_limpo = text[:tamanho_maximo].rsplit(' ', 1)[0]
        
        return resumo_limpo + "..."

