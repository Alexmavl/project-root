# ---- Build stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# Copiar dependencias e instalar (incluye dev)
COPY package*.json ./
RUN npm ci

# Copiar código y compilar TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Runtime stage ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiar build compilado desde el stage builder
COPY --from=builder /app/dist ./dist

# Ajusta el puerto de la API si usas otro
ENV PORT=3001
EXPOSE 3001

# Arranque del servidor
CMD ["node", "dist/server.js"]
