ARG NODE_VERSION=16
FROM node:${NODE_VERSION}-alpine

WORKDIR /app
COPY ./packages/server/ ./packages/server/
COPY ./package.json ./pnpm-lock.yaml ./

WORKDIR /app/packages/server

# Conditional installation of pnpm based on Node.js version
RUN NODE_VERSION=$(node -v) && \
    if [[ "$NODE_VERSION" == v16* ]]; then \
        PNPM_VERSION="v8"; \
    else \
        PNPM_VERSION="v9"; \
    fi; \
    npm i -g pnpm@$PNPM_VERSION; \
    echo "pnpm version:" $PNPM_VERSION; \
    pnpm install
