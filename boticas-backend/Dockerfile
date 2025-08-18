# Imagen oficial de Node 20 con Alpine (ligera y segura)
FROM node:20-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiar package*.json primero (cache de capas)
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el resto del código
COPY . .

# Exponer puerto (igual que tu .env)
EXPOSE 4000

# Comando por defecto al iniciar el contenedor
#CMD ["node", "src/server.js"]
CMD ["npm", "run", "start"]