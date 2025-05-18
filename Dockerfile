FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build:all

CMD ["node", "dist/apps/gateway/main"] 