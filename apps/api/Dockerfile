FROM node:20 AS builder

WORKDIR /app
RUN npm config set registry https://registry.npmmirror.com
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npx prisma generate && npm run build

FROM node:20-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/main"]
