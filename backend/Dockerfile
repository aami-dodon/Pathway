FROM node:22.17.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
RUN corepack enable pnpm
WORKDIR /app

# Copy shared and backend package files
COPY shared/package.json ./shared/
COPY backend/package.json backend/pnpm-lock.yaml* ./backend/

# Install dependencies
RUN cd shared && pnpm install
RUN cd backend && pnpm install --frozen-lockfile


# Rebuild the source code only when needed
FROM base AS builder
RUN corepack enable pnpm
WORKDIR /app
COPY --from=deps /app/shared/node_modules ./shared/node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY . .

# Run branding generation
RUN cd shared && node generate.js

# Build the backend app
WORKDIR /app/backend
RUN pnpm run build

# Production image, copy all the files and run next
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

# Standalone server files
COPY --from=builder --chown=nextjs:nodejs /app/backend/.next/standalone ./
# Static files for the server
COPY --from=builder --chown=nextjs:nodejs /app/backend/.next/static ./.next/static

USER nextjs

EXPOSE 9006

ENV PORT=9006

# server.js is looking for files relative to its location
CMD ["node", "server.js"]
