# 1. Build stage
FROM node:18.18.0 AS builder

WORKDIR /app

# 캐시 최적화를 위해 package 파일만 먼저 복사
COPY package.json package-lock.json ./

# 의존성 설치
RUN npm ci

# 앱 전체 복사
COPY . .

# 빌드
RUN npm run build

# 2. Production stage
FROM node:18.18.0-slim AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./

EXPOSE 3000
ENV NODE_ENV production

CMD ["npm", "start"]
