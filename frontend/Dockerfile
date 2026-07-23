# Doc 3 note: node:20-slim is pinned to major-version-only, same
# reproducibility gap as the backend Dockerfile - not pinning to an exact
# patch/digest without network access to verify a current tag exists.
#
# Doc 3 note: `next.config.ts` already sets `output: "standalone"`, and the
# runner stage below only copies `.next/standalone` + `.next/static` +
# `public` - Prisma's generated client includes a native query-engine binary
# that Next.js's standalone-output file tracing doesn't always detect
# correctly (a known Next.js+Prisma gotcha, not specific to this project).
# If the built image fails at runtime with a "Cannot find module
# '.prisma/client'" or a missing query-engine error, the fix is copying
# `node_modules/.prisma` and `node_modules/@prisma/client` from the builder
# stage into the runner stage explicitly - not changed here since I can't
# run the build to confirm whether it's actually needed for this project's
# Prisma version/schema.
FROM node:20-slim AS base

# openssl: without it Prisma can't find the CLI to probe the OpenSSL version,
# detection fails, and it silently falls back to generating/loading a
# debian-openssl-1.1.x engine - which then can't find libssl.so.1.1 at
# runtime, since bookworm only ships libssl.so.3. Needed in both stages:
# builder for `prisma generate` to detect correctly, runner for the generated
# engine to actually find libssl at container start.
# wget: node:20-slim has neither by default - docker-compose.yaml's
# healthcheck for this service shells out to wget, which otherwise fails with
# "not found" on every single check, forever reporting unhealthy regardless
# of whether the app is actually up.
RUN apt-get update -y && apt-get install -y openssl wget && rm -rf /var/lib/apt/lists/*

FROM base AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

# @prisma/client's generated client isn't checked into git and there's no
# postinstall hook wiring this up - db.ts imports PrismaClient directly, so
# without this the build fails in any clean environment (CI, this image).
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

ARG NEXT_PUBLIC_GRAPHQL_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG DATABASE_URL
ARG DIRECT_URL
ARG SUPABASE_URL
ARG SUPABASE_KEY
ARG ADMIN_USER_ID
ARG SECRET
ARG CLERK_SECRET_KEY
ENV NEXT_PUBLIC_GRAPHQL_URL=$NEXT_PUBLIC_GRAPHQL_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_KEY=$SUPABASE_KEY
ENV ADMIN_USER_ID=$ADMIN_USER_ID
ENV SECRET=$SECRET
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]