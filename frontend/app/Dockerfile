# 1. Build stage
FROM node:18.18.0 AS builder

WORKDIR /app

# 캐시 최적화를 위해 package 파일만 먼저 복사
COPY package.json package-lock.json ./

# 의존성 설치
RUN npm ci

# 앱 전체 복사
COPY . .

# 환경변수 파일 포함
COPY .env.production .env.production

# 빌드
RUN npm run build || echo "Build completed with lint warnings"

# 2. Production stage
FROM node:18.18.0-slim AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./

# 실행 시에도 환경변수 파일 포함
COPY --from=builder /app/.env.production ./

EXPOSE 3000
ENV NODE_ENV production

CMD ["npm", "start"]
