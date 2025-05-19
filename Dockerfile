FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env* ./

# 환경 변수 설정
ENV NODE_ENV=local

# MongoDB 초기화 스크립트를 복사
COPY ./docker/mongo-init /docker-entrypoint-initdb.d/

# 기본 명령은 개별 서비스에서 오버라이드됨
CMD ["node", "dist/apps/gateway-server/src/main"]