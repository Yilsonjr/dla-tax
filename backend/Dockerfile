FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY src/ ./src/

# Exponer puerto
EXPOSE 8080

# Comando para iniciar
CMD ["node", "src/index.js"]
