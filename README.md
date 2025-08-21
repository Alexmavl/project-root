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
- `git clone https://github.com/Alexmavl/project-root.git`
- `cd project-root`

# Instalar dependencias
npm install

# ⚙️ Variables de entorno
 Crea un archivo .env en la raíz (o usa src/config/env.ts que ya lee process.env):

- `NODE_ENV=development`
- `PORT=3000`
- `LOG_LEVEL=info`
- `JWT_SECRET=supersecretchangeit`

- `DB_USER=sa`
- `DB_PASSWORD=YourStrong!Passw0rd`
- `DB_NAME=gestiondb`
- `DB_HOST=localhost`
- `DB_PORT=1433`
- `DB_TRUST_CERT=true`

# 🐳 Levantar SQL Server con Docker
## docker-compose.yml (sugerido)

- `Coloca este archivo en la raíz del proyecto:`
services:
  sqlserver:
    container_name: gestionmssql2022
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_SA_PASSWORD=YourStrong!Passw0rd
    ports:
      - "1433:1433"
    volumes:
      - ./mssql-data:/var/opt/mssql
    restart: unless-stopped

## Levantar:
docker compose up -d

## Ver logs (opcional):


 Los PS y Tablas de la base de datos gestiondb se encuentran en la carpeta db dentro de la carpeta src que se tienen crear en la base de datos

 # ▶️ Correr la API

- `npm run dev     # nodemon (dev)`

- `API: http://localhost:3000`

- `Swagger: http://localhost:3000/docs`

## 🔐 Flujo de autenticación

 Crear usuario (público): POST /usuarios

- `{ "nombre":"Tec 1", "email":"tecnico@demo.com", "rol":"tecnico", "password":"Secret123!" }`

## Login: POST /auth/login → devuelve { token, user }
## Usar token en rutas protegidas:
## Header → Authorization: Bearer <token>

# 🔌 Puertos

## 3000 → API Node/Express

## 1433 → SQL Server en Docker

Asegúrate de que no estén en uso. Si EADDRINUSE: 3000, mata el proceso que ocupa ese puerto (PowerShell):

- `Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess`
- `Stop-Process -Id <PID> -Force`

# 🧪 Endpoints útiles

- ` POST /usuarios (crear usuario)`

- ` GET /usuarios (listar) – protegido, típicamente para coordinador`

- ` POST /auth/login (obtener token)`

- ` GET /expedientes (listar)`

- ` POST /expedientes (crear, requiere rol tecnico)`
 
- ` GET /expedientes/{id} (obtener por id)`

- ` GET /expedientes/codigo/{codigo} (obtener por código)`

- ` PATCH /expedientes/{id}/estado (requiere coordinador)`

- ` GET /expedientes/:id/indicios (listar por expediente)`

- ` POST /expedientes/:id/indicios (crear indicio)`

# 🛠️ Troubleshooting

- ` Login failed for user 'sa'`
- ` Verifica MSSQL_SA_PASSWORD en Docker y .env.`
- `Usa -C en sqlcmd para aceptar el certificado.`

- ` Invalid object name 'dbo.sp_X'`
- `Creaste el SP en master. Verifica USE gestiondb; y GO.`
- `En Node llama dbo.sp_Nombre.`

- `Error converting nvarchar to uniqueidentifier`
- `Valida GUID en el controlador y/o envía sql.`
- `UniqueIdentifier desde tu helper.`

- `Swagger no muestra rutas`
- `Revisa setupSwagger → apis: ['src/**/*.routes.ts', `
- `'src/app.ts'] y comentarios JSDoc.`
