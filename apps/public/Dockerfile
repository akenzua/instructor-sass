# ── Stage 1: Install dependencies ──────────────────────────────────
FROM node:20-alpine AS deps
RUN npm install -g pnpm@8.14.0
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/public/package.json ./apps/public/
COPY packages/shared/package.json ./packages/shared/
COPY packages/theme/package.json ./packages/theme/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile

# ── Dev stage ──────────────────────────────────────────────────────
FROM node:20-alpine AS dev
RUN npm install -g pnpm@8.14.0
WORKDIR /app

EXPOSE 3004
CMD ["sh", "-c", "pnpm install --frozen-lockfile && pnpm --filter @acme/public dev"]

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
COPY --from=deps /app/apps/public/node_modules ./apps/public/node_modules
COPY --from=build-shared /app/packages ./packages
COPY apps/public ./apps/public
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./

ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
ARG NEXT_PUBLIC_IDEAL_POSTCODES_API_KEY=""
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_IDEAL_POSTCODES_API_KEY=$NEXT_PUBLIC_IDEAL_POSTCODES_API_KEY

RUN pnpm --filter @acme/public build

# ── Stage 4: Production runner ────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3004
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=build --chown=nextjs:nodejs /app/apps/public/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/public/.next/static ./apps/public/.next/static

USER nextjs

EXPOSE 3004

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3004/ || exit 1

CMD ["dumb-init", "node", "apps/public/server.js"]
