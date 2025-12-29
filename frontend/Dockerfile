FROM node:22.17.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
RUN corepack enable pnpm
WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml ./
COPY package.json ./

# Copy all package files for packages and frontend
COPY packages ./packages
COPY frontend/package.json frontend/pnpm-lock.yaml* ./frontend/

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

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Run brand generation and asset sync
RUN node packages/brand/scripts/generate.js && node packages/ui/scripts/build.js && node packages/brand/scripts/sync-assets.js

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
COPY --from=builder /app/frontend/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone output (server.js and structure)
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./

# CRITICAL: Replace the symlinked node_modules with actual dependencies from deps stage
RUN rm -rf /app/node_modules
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /app/frontend/node_modules ./frontend/node_modules

# Copy static files
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static

WORKDIR /app/frontend

USER nextjs

EXPOSE 9007

ENV PORT=9007

CMD ["node", "server.js"]
