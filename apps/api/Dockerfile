FROM node:20-alpine AS builder

WORKDIR /app
RUN apk add --no-cache git python3 make g++ openssl \
 && npm config set registry https://registry.npmmirror.com
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npx prisma generate && npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl \
 && npm config set registry https://registry.npmmirror.com
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/main"]
