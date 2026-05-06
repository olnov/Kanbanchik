FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

# ---- Install workspace deps ----
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile --filter=backend...

# ---- Build ----
FROM deps AS builder
COPY tsconfig.base.json ./
COPY apps/backend ./apps/backend
RUN pnpm --filter backend build

# ---- Create flat production bundle (no pnpm symlinks) ----
FROM base AS deployer
WORKDIR /app
COPY --from=builder /app ./
RUN pnpm deploy --filter=backend --prod --legacy /deploy

# ---- Minimal production image ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deployer /deploy/node_modules ./node_modules
COPY --from=deployer /deploy/package.json ./
COPY --from=builder /app/apps/backend/dist ./dist
EXPOSE 3001
CMD ["node", "dist/main.js"]
