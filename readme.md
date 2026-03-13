# Biblioteca - Sistema de Gerenciamento de Livros

Aplicacao com frontend em Angular e backend em NestJS, com infraestrutura baseada em Docker (MySQL, Kafka, Elastic, Keycloak e Kong).

## Stack

- Backend: NestJS, TypeScript, TypeORM, Jest
- Frontend: Angular
- Banco de dados: MySQL
- Infra: Docker Compose, Kafka, Elasticsearch, Keycloak, Kong/Konga

## Pre-requisitos

- Node.js 18+
- npm
- Docker e Docker Compose

## Variaveis de ambiente

Arquivos de exemplo disponiveis:

- `./.env.example` (variaveis de infraestrutura/stack)
- `./backend/.env.example` (variaveis usadas pelo backend)

Passos sugeridos:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Depois ajuste os segredos (`change-me`) antes de subir em ambientes reais.

## Rodando em desenvolvimento (Node local)

1. Instale dependencias da raiz:

```bash
npm install
```

2. Instale dependencias dos modulos:

```bash
npm --prefix backend install
npm --prefix frontend install
```

3. Suba os servicos de apoio (exemplo minimo):

```bash
docker compose up -d mysql kafka elasticsearch zookeeper
```

4. Rode frontend e backend juntos pela raiz:

```bash
npm run dev
```

Endpoints locais esperados:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`

## Rodando stack completa com Docker

Para subir todos os servicos definidos no `docker-compose.yml` da raiz:

```bash
docker compose up -d --build
```

Para parar tudo:

```bash
docker compose down
```

## Comandos uteis

- Backend: `npm --prefix backend run start:dev`
- Frontend: `npm --prefix frontend run start`
- Testes backend: `npm --prefix backend run test`
- Build backend: `npm --prefix backend run build`
- Build frontend: `npm --prefix frontend run build`
- Logs Docker: `docker compose logs -f`

## Observacoes

- O arquivo `env.md` pode ser usado como referencia de variaveis para producao.
- Garanta que as portas necessarias estejam livres (`3000`, `4200`, `3306`, `8000`, `8080`, `9200`, `9092`).