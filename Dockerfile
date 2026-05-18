# ============================================================
# RNA Guide Backend - Dockerfile production (multi-stage)
# ============================================================

# ── Stage 1: Build ────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Installer TOUTES les dépendances (y compris devDependencies pour la compilation)
RUN npm ci

# Copier le code source
COPY prisma ./prisma
COPY src ./src

# Générer le client Prisma
RUN npx prisma generate

# Compiler TypeScript
RUN npm run build

# ── Stage 2: Production ───────────────────────────────────────
FROM node:22-alpine AS production

RUN apk add --no-cache openssl

# Sécurité: utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copier uniquement les dépendances de production
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copier le build compilé
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copier le schéma Prisma (nécessaire pour les migrations)
COPY prisma ./prisma

# Script de démarrage avec retry pour Neon
COPY start.sh ./start.sh

# Permissions
RUN chown -R nestjs:nodejs /app && chmod +x /app/start.sh
USER nestjs

# Port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

# Démarrer
CMD ["/app/start.sh"]
