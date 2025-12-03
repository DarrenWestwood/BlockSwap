# -----------------------------
# Backend – Builder
# -----------------------------
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --production=false

COPY . .

# -----------------------------
# Backend – Production
# -----------------------------
FROM node:20-slim

WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./server.js

ENV PORT=3001
EXPOSE 3001

CMD ["node", "server.js"]
