FROM node:22.17.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
RUN corepack enable pnpm
WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml ./
COPY package.json ./

# Copy all package files for packages and backend
COPY packages/brand ./packages/brand
COPY backend/package.json backend/pnpm-lock.yaml* ./backend/

# Install all dependencies from workspace root with shamefully-hoist for flat structure
RUN pnpm install --shamefully-hoist


# Rebuild the source code only when needed
FROM base AS builder
RUN corepack enable pnpm
WORKDIR /app

# Copy everything from deps (node_modules, packages, etc)
COPY --from=deps /app ./

# Copy source
COPY . .

# Run brand generation and asset sync
RUN node packages/brand/scripts/generate.js && node packages/brand/scripts/sync-assets.js

# Build the backend app
WORKDIR /app/backend
RUN pnpm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Public folder
COPY --from=builder /app/backend/public ./public

# Set the correct permission
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone output (server.js and structure)
COPY --from=builder --chown=nextjs:nodejs /app/backend/.next/standalone ./

# CRITICAL: Replace the symlinked node_modules with actual dependencies from deps stage
# This is necessary because pnpm creates symlinks that break when copied to a different structure
RUN rm -rf /app/node_modules
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /app/backend/node_modules ./backend/node_modules

# Copy static files to where server.js expects them
# For monorepo standalone, Next.js expects static at .next/static relative to server.js
COPY --from=builder --chown=nextjs:nodejs /app/backend/.next/static ./.next/static

USER nextjs

EXPOSE 9006

ENV PORT=9006

CMD ["node", "server.js"]
