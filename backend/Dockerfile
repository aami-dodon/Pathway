FROM node:22.17.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
RUN corepack enable pnpm
WORKDIR /app

# Copy workspace config and package files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY packages/brand/package.json ./packages/brand/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies for backend and its local workspace dependencies
RUN pnpm install --frozen-lockfile --shamefully-hoist --filter backend...

# Rebuild the source code only when needed
FROM base AS builder
RUN corepack enable pnpm
WORKDIR /app

# Copy node_modules and setup from deps
COPY --from=deps /app ./

# Copy source
COPY . .

# Run global generation (brand assets, etc)
RUN pnpm run generate

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

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/backend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/backend/.next/static ./backend/.next/static

# CRITICAL: Restore node_modules to fix broken pnpm symlinks in standalone build
RUN rm -rf /app/node_modules
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /app/backend/node_modules ./backend/node_modules

USER nextjs

EXPOSE 9006
ENV PORT=9006

# The standalone output puts server.js inside the app directory
WORKDIR /app/backend

CMD ["node", "server.js"]
