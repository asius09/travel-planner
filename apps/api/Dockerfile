# ============================================
# Travel Planner API — Fly.io Machines
# Optimized multi-stage Dockerfile
# ============================================

# --- Base: Node + pnpm ---
FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate
WORKDIR /app

# --- Dependencies: layer-cached install ---
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY patches ./patches
RUN pnpm install --frozen-lockfile

# --- Build: compile shared + api to JavaScript ---
FROM deps AS builder
COPY . .
# Create a build tsconfig for shared (emit to dist/)
RUN echo '{"extends":"./tsconfig.json","compilerOptions":{"noEmit":false,"outDir":"dist","module":"CommonJS","target":"ES2022","moduleResolution":"node","skipLibCheck":true,"resolveJsonModule":true,"esModuleInterop":true,"allowSyntheticDefaultImports":true,"declaration":false,"declarationMap":false},"include":["src/**/*"],"exclude":["node_modules","dist"]}' > packages/shared/tsconfig.build.json
# Compile shared package to JS
RUN pnpm --filter shared exec tsc -p tsconfig.build.json
# Compile api package to JS
RUN pnpm --filter api exec tsc -p tsconfig.build.json
# Fix shared package.json main field to point to compiled JS
RUN node -e "const p=require('./packages/shared/package.json'); p.main='dist/index.js'; require('fs').writeFileSync('./packages/shared/package.json', JSON.stringify(p,null,2))"

# --- Runner: minimal production image ---
FROM base AS runner
ENV NODE_ENV=production
ENV API_PORT=3001
WORKDIR /app

# Copy compiled JS from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
# Copy shared package to root level so the workspace symlink resolves
COPY --from=builder /app/packages/shared /app/packages/shared
# Copy patches directory for pnpm frozen-lockfile
COPY --from=builder /app/patches ./patches
# Copy pnpm lockfile and package manifests for fresh install
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/apps/api/package.json ./apps/api/package.json
# Install all dependencies fresh so pnpm symlinks work correctly
RUN pnpm install --frozen-lockfile

# Non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser \
    && mkdir -p /home/appuser/.corepack \
    && chown -R appuser:appuser /home/appuser
USER appuser

EXPOSE 3001
# Run compiled JS; if app crashes, keep container alive for debugging
CMD ["sh", "-c", "node /app/apps/api/dist/apps/api/src/index.js || sleep 3600"]