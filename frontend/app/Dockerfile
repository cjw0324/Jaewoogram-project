# 1. Build stage
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Next.js 환경 변수 설정 (필요 시)
# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# 2. Production stage (with lighter image)
FROM node:20-slim AS runner

WORKDIR /app

# 프로덕션 실행에 필요한 파일만 복사
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./

# Next.js 앱 포트
EXPOSE 3000

ENV NODE_ENV production

CMD ["node_modules/.bin/next", "start"]
