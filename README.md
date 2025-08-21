# API de Gestión de Expedientes e Indicios (SP + SQL Server)

## Requisitos
- Node.js 18+
- SQL Server 2019/2022 (local o Docker)
- npm

## Instalación
```bash
cp .env.example .env
npm install
npm run dev
```

## Endpoints iniciales
- `GET /health`
- `GET /health/db`
- `POST /auth/login`
- `POST /usuarios`
- `GET /expedientes`
- `POST /expedientes`

## Swagger
- `http://localhost:${PORT:-3000}/docs`

# API Expedientes e Indicios (Node + SQL Server)

## API REST con autenticación JWT, control de roles (tecnico / coordinador), y acceso a datos mediante procedimientos almacenados.

- ` Backend: Node.js + Express + TypeScript`

- ` BD: SQL Server 2022 en Docker`

- ` Auth: JWT (bearer)`

- ` Docs: Swagger en /docs`

# 🔧 Requisitos

- `Node.js 18+ (recomendado LTS)`

- `npm 9+`

- `Docker y Docker Compose`

- `Postman (opcional)`

- `Powershell / CMD`

# 📦 Clonar e instalar dependencias
# Clonar
git clone https://github.com/Alexmavl/project-root.git
cd project-root

# Instalar dependencias
npm install
