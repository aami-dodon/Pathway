FROM node:22.17.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
RUN corepack enable pnpm
WORKDIR /app

# Copy shared and frontend package files
COPY shared/package.json ./shared/
COPY frontend/package.json frontend/pnpm-lock.yaml* ./frontend/

# Install dependencies (unhoisted to ensure they are available to both)
RUN cd shared && pnpm install
RUN cd frontend && pnpm install --frozen-lockfile


# Rebuild the source code only when needed
FROM base AS builder
RUN corepack enable pnpm
WORKDIR /app
COPY --from=deps /app/shared/node_modules ./shared/node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Run branding generation
RUN cd shared && node generate.js

# Build the frontend app
WORKDIR /app/frontend
# Next.js 15+ standalone build is reliable if we build from the app folder
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Public folder needs to be at the root of the runner app
COPY --from=builder /app/frontend/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# IMPORTANT: In standalone mode, Next.js puts everything into .next/standalone
# For subfolder apps built from root, this often results in a 'frontend' subfolder inside standalone.
# We copy the contents of standalone to the root.
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
# AND we MUST copy static files to .next/static so the server can find them
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./.next/static

USER nextjs

EXPOSE 9007

ENV PORT=9007

# server.js is looking for files relative to its location
CMD ["node", "server.js"]
