# ── Stage 1: Install dependencies ──────────────────────────────────
FROM node:20-alpine AS deps
RUN npm install -g pnpm@8.14.0
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

# ── Dev stage ──────────────────────────────────────────────────────
FROM node:20-alpine AS dev
RUN npm install -g pnpm@8.14.0
WORKDIR /app

EXPOSE 3000
CMD ["sh", "-c", "pnpm install --frozen-lockfile && pnpm --filter @acme/api dev"]

# ── Stage 2: Build shared packages ────────────────────────────────
FROM node:20-alpine AS build-shared
RUN npm install -g pnpm@8.14.0
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY packages/shared ./packages/shared
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./

RUN pnpm --filter @acme/shared build

# ── Stage 3: Build the API ────────────────────────────────────────
FROM node:20-alpine AS build
RUN npm install -g pnpm@8.14.0
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build-shared /app/packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./

RUN pnpm --filter @acme/api build

# ── Stage 4: Production runner ────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init
WORKDIR /app

ENV NODE_ENV=production

# Copy built output and production deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build-shared /app/packages/shared ./packages/shared
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY apps/api/package.json ./apps/api/
COPY package.json ./

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["dumb-init", "node", "apps/api/dist/main"]
