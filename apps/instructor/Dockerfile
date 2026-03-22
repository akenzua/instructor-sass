# ── Stage 1: Install dependencies ──────────────────────────────────
FROM node:20-alpine AS deps
RUN npm install -g pnpm@8.14.0
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/instructor/package.json ./apps/instructor/
COPY packages/shared/package.json ./packages/shared/
COPY packages/theme/package.json ./packages/theme/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile

# ── Dev stage ──────────────────────────────────────────────────────
FROM node:20-alpine AS dev
RUN npm install -g pnpm@8.14.0
WORKDIR /app

EXPOSE 3001
CMD ["sh", "-c", "pnpm install --frozen-lockfile && pnpm --filter @acme/instructor dev"]

# ── Stage 2: Build shared packages ────────────────────────────────
FROM node:20-alpine AS build-shared
RUN npm install -g pnpm@8.14.0
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/ ./packages/
COPY packages/shared ./packages/shared
COPY packages/theme ./packages/theme
COPY packages/ui ./packages/ui
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./

RUN pnpm --filter @acme/shared build && \
    pnpm --filter @acme/theme build && \
    pnpm --filter @acme/ui build

# ── Stage 3: Build the Next.js app ────────────────────────────────
FROM node:20-alpine AS build
RUN npm install -g pnpm@8.14.0
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/instructor/node_modules ./apps/instructor/node_modules
COPY --from=build-shared /app/packages ./packages
COPY apps/instructor ./apps/instructor
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./

ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm --filter @acme/instructor build

# ── Stage 4: Production runner ────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=build --chown=nextjs:nodejs /app/apps/instructor/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/instructor/.next/static ./apps/instructor/.next/static

USER nextjs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/ || exit 1

CMD ["dumb-init", "node", "apps/instructor/server.js"]
