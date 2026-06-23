# Diário Inteligente Clareza
### TCC – Análise e Desenvolvimento de Sistemas | IFRS – Campus Rio Grande

Protótipo mobile para acompanhamento terapêutico com reconhecimento de emoções por Inteligência Artificial. O paciente registra diários emocionais em texto livre, a IA (Google Gemini 3.1 Flash Lite) identifica a emoção predominante e gera um resumo estruturado, enquanto o psicólogo acompanha a evolução clínica do paciente por meio de um dashboard.

> ⚠️ **Status:** Protótipo funcional desenvolvido para fins acadêmicos. Esta aplicação não deve ser utilizada em ambiente de produção clínico sem as devidas adequações legais e técnicas exigidas pela LGPD.

---

## 🎯 Objetivo
Criar uma aplicação móvel que auxilie na organização e reflexão emocional, garantindo que o paciente seja o único proprietário dos seus dados e estabelecendo o psicólogo como o mediador essencial da interpretação clínica.

## ✨ Funcionalidades
* **Autenticação por perfil:** Acesso segmentado para Pacientes e Psicólogos (validação via CRP).
* **Vínculo terapêutico:** Fluxo de solicitação de acompanhamento, aceite e revogação pelo paciente.
* **Diário Emocional:** Registro de sentimentos e ocorrências em formato de texto livre.
* **Processamento NLP:** Identificação de emoções e geração de resumos automatizados via API do Gemini.
* **Dashboard Clínico:** Visualização de dados, oscilações de humor e gráficos de pizza.
* **Privacidade:** Compartilhamento seletivo de diários com o profissional vinculado.

## 🏗️ Arquitetura do Projeto
```text
diarioInteligente/
├── backend/               # FastAPI + Python
│   ├── src/main.py
│   ├── src/routers/
│   ├── src/services/ai_service.py
│   └── docker-compose.yml
├── frontend/              # React Native + Expo
│   ├── app/(tabs)/
│   ├── app/(tabs_psi)/
│   └── package.json
└── README.md
```

> 💾 **Estratégia de Persistência:** O sistema utiliza uma abordagem de banco de dados híbrido. O PostgreSQL gerencia os dados relacionais (autenticação, perfis e vínculos), enquanto o MongoDB armazena os registros textuais e os retornos dinâmicos do LLM.

---

## 🚀 Tecnologias Utilizadas
* **Mobile:** React Native 0.83, Expo 55, TypeScript
* **Backend:** FastAPI, Uvicorn, SQLAlchemy, Python 3.12
* **Inteligência Artificial:** Google Gemini 3.1 Flash Lite
* **Banco de Dados:** PostgreSQL 15, MongoDB 7
* **Infraestrutura:** Docker & Docker Compose

---

## ⚙️ Como Executar o Projeto

### 📋 Pré-requisitos
Antes de começar, você vai precisar das seguintes ferramentas instaladas:
* [Node.js 20+](https://nodejs.org)
* [Python 3.12+](https://python.org)
* [Docker Desktop](https://www.docker.com/products/docker-desktop) *(Obrigatório. No Windows, ative a virtualização e o WSL2)*
* [Git](https://git-scm.com)
* Uma chave de API do [Google AI Studio (Gemini)](https://google.com)

---

### 1. Configuração do Backend (API)
Abra o terminal, navegue até à pasta do servidor, configure as credenciais e inicie os serviços:

```bash
# Entre na pasta do backend
cd backend

# Copie o arquivo de exemplo para o oficial
cp .env.example .env
```
> 🔑 **IMPORTANTE:** Edite o arquivo `.env` gerado e insira a sua `GEMINI_API_KEY` junto com as outras variáveis (veja a seção de credenciais abaixo).

```bash
# Suba os containers do banco de dados (PostgreSQL e MongoDB)
docker-compose up -d

# Configure o ambiente virtual Python
python -m venv .venv

# Ative o ambiente virtual
# No Windows:
.venv\Scripts\activate
# No Linux/Mac:
source .venv/bin/activate

# Instale as dependências lendo o arquivo pyproject.toml
pip install .

# Inicie a aplicação em modo de desenvolvimento
uvicorn src.main:app --reload
```
Acesse a documentação interativa da API (Swagger UI) em: http://localhost:8000/docs

---

### 2. Configuração do Frontend (Mobile)
Em uma nova janela do terminal, instale as dependências e inicie o Expo:

```bash
# Entre na pasta do frontend
cd frontend

# Instale os pacotes Node
npm install

# Inicie o servidor do Expo
npx expo start
```


#### 🤖 Executando no Emulador (Android Studio)
Execute a aplicação dentro do ambiente virtual emulado:

1. Certifique-se de que as ferramentas de virtualização (IOMMU/SVM/Hyper-V) estão ativas no seu sistema.
2. Abra o **Android Studio** e acesse o **Device Manager** (Gerenciador de Dispositivos).
3. Inicie o seu dispositivo virtual configurado (recomenda-se uma API estável) clicando no botão de *Play*.
4. Aguarde a completa inicialização do sistema Android no emulador.
5. Com o emulador aberto, vá até o terminal onde executou o `npx expo start` e pressione a tecla **`a`** no teclado.
6. O Metro Bundler fará o download automático do cliente do Expo Go para dentro do emulador e abrirá o projeto diretamente na tela de autenticação.

---

## 🔐 Variáveis de Ambiente
Certifique-se de preencher o arquivo `.env` localizado no diretório `/backend` com a seguinte estrutura básica:

```env
GEMINI_API_KEY=sua_chave_da_api_do_google_aqui
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/diario
MONGO_URL=mongodb://localhost:27017/diario
JWT_SECRET=sua_chave_secreta_jwt_aqui
LLM_MODEL = "gemini-3.1-flash-lite"
```

---

## 📄 Licença
Desenvolvido como projeto de conclusão de curso (TCC) – Instituto Federal do Rio Grande do Sul (IFRS), período 2025/2026.