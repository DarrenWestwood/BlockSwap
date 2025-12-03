# -----------------------------
# Frontend – Builder
# -----------------------------
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# -----------------------------
# Frontend – Production Web Server (NGINX)
# -----------------------------
FROM nginx:1.27-alpine

WORKDIR /usr/share/nginx/html

# Remove default HTML
RUN rm -rf ./*

# Copy build output
COPY --from=builder /app/dist ./

# Copy simple NGINX config (allows SPA routes)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
