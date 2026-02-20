# Biblioteca - Sistema de Gerenciamento de Livros

## Tecnologias Utilizadas

- **Backend**: NestJS (Node.js framework), TypeScript, TypeORM (ORM para MySQL), Jest (para testes)
- **Frontend**: Angular (framework JavaScript/TypeScript)
- **Banco de Dados**: MySQL (executado via Docker)
- **Outros**: Docker (apenas para MySQL), ESLint, Prettier

## Como Iniciar o Sistema

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Docker e Docker Compose

### Passos para Iniciar

1. **Clone o repositório** (se aplicável) e navegue para a pasta raiz do projeto.

2. **Inicie o MySQL via Docker**:
   ```bash
   docker-compose up mysql -d
   ```
   Isso iniciará o container MySQL em background. O banco de dados estará disponível na porta 3306.

3. **Configure o Backend**:
   - Navegue para a pasta `backend`:
     ```bash
     cd backend
     ```
   - Instale as dependências:
     ```bash
     npm install
     ```
   - Execute as migrações do banco de dados (se necessário):
     ```bash
     npm run migration:run
     ```
   - Inicie o servidor em modo de desenvolvimento:
     ```bash
     npm run start:dev
     ```
     O backend estará rodando em `http://localhost:3000` (ou a porta configurada).

4. **Configure o Frontend**:
   - Navegue para a pasta `frontend`:
     ```bash
     cd frontend
     ```
   - Instale as dependências:
     ```bash
     npm install
     ```
   - Inicie o servidor de desenvolvimento:
     ```bash
     npm start
     ```
     O frontend estará rodando em `http://localhost:4200` (porta padrão do Angular).

5. **Acesse a aplicação**:
   - Abra o navegador e vá para `http://localhost:4200` para acessar o frontend.
   - O backend estará disponível via API em `http://localhost:3000`.

### Comandos Úteis

- **Backend**:
  - Testes: `npm run test`
  - Build: `npm run build`
  - Lint: `npm run lint`

- **Frontend**:
  - Testes: `npm run test`
  - Build: `npm run build`

- **Docker**:
  - Parar MySQL: `docker-compose down`
  - Ver logs: `docker-compose logs mysql`

### Notas

- Certifique-se de que as portas 3000 (backend), 4200 (frontend) e 3306 (MySQL) estejam livres.
- Para produção, ajuste as configurações de ambiente conforme necessário.