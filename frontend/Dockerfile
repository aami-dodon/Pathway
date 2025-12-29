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

# Install dependencies for frontend and its local workspace dependencies
RUN pnpm install --frozen-lockfile --shamefully-hoist --filter frontend...

# Rebuild the source code only when needed
FROM base AS builder
RUN corepack enable pnpm
WORKDIR /app

# Copy node_modules and setup from deps
COPY --from=deps /app ./

# Copy source
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG INTERNAL_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV INTERNAL_API_URL=${INTERNAL_API_URL}

# Remove any .env files that might have been copied before building (recursively)
# We keep .env.example but remove all others that Next.js might load
RUN find . -name ".env*" ! -name ".env.example" -delete

# Run global generation (brand assets, etc)
RUN pnpm run generate

# Build the frontend app
WORKDIR /app/frontend
RUN pnpm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Public folder
COPY --from=builder /app/frontend/public ./frontend/public

# Set the correct permission
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static

# CRITICAL: Restore node_modules to fix broken pnpm symlinks in standalone build
RUN rm -rf /app/node_modules
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /app/frontend/node_modules ./frontend/node_modules

# Remove any .env files that might override Docker environment variables
RUN rm -f /app/.env /app/frontend/.env

USER nextjs

EXPOSE 9007
ENV PORT=9007

# The standalone output puts server.js inside the app directory
WORKDIR /app/frontend

CMD ["node", "server.js"]
