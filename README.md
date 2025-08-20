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
