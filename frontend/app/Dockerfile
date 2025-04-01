# frontend/app/Dockerfile

# 1. 빌드 스테이지
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2. 프로덕션 실행 스테이지
FROM node:20-slim

WORKDIR /app
COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]
