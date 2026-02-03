# Biblioteca - Sistema de Gerenciamento de Livros

## Tecnologias Utilizadas (Stack)

- **Backend**: NestJS (framework Node.js), TypeScript, TypeORM (ORM para MySQL), Jest (para testes unitários e de integração)
- **Frontend**: Angular (framework JavaScript/TypeScript)
- **Banco de Dados**: MySQL (executado via Docker)
- **Containerização**: Docker e Docker Compose
- **Outros**: ESLint, Prettier, JWT para autenticação

## Como Iniciar o Projeto

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Docker e Docker Compose

### Passos para Iniciar

1. **Clone o repositório** (se aplicável) e navegue para a pasta raiz do projeto.

2. **Inicie o banco de dados MySQL via Docker**:
   ```bash
   docker compose up -d
   ```
   Isso iniciará o container MySQL em background. O banco de dados estará disponível na porta 3306.

3. **Instale as dependências e inicie o projeto**:
   - Na raiz do projeto, instale as dependências:
     ```bash
     npm install
     ```
   - Execute as migrações do banco de dados (se necessário):
     ```bash
     cd backend && npm run migration:run
     ```
   - Volte para a raiz e inicie o projeto em modo de desenvolvimento:
     ```bash
     npm run dev
     ```
     Isso iniciará tanto o backend (porta 3000) quanto o frontend (porta 4200) simultaneamente.

4. **Acesse a aplicação**:
   - Abra o navegador e vá para `http://localhost:4200` para acessar o frontend.
   - O backend estará disponível via API em `http://localhost:3000`.

### Comandos Úteis

- **Raiz do Projeto**:
  - Iniciar desenvolvimento: `npm run dev`
  - Apenas backend: `npm run backend`
  - Apenas frontend: `npm run frontend`

- **Backend** (dentro da pasta `backend`):
  - Testes unitários: `npm run test`
  - Testes e2e (usando Supertest): `npm run test:e2e`
  - Build: `npm run build`
  - Lint: `npm run lint`
  - Migrações: `npm run migration:run`

- **Frontend** (dentro da pasta `frontend`):
  - Testes: `npm run test`
  - Build: `npm run build`

- **Docker**:
  - Parar serviços: `docker compose down`
  - Ver logs: `docker compose logs`

### Notas

- Certifique-se de que as portas 3000 (backend), 4200 (frontend) e 3306 (MySQL) estejam livres.
- Para produção, ajuste as configurações de ambiente conforme necessário.
- O projeto utiliza `concurrently` para executar backend e frontend ao mesmo tempo no modo dev.