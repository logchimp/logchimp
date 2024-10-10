FROM node:16-alpine

WORKDIR /app
COPY ./packages/server/ ./packages/server/
COPY ./package.json ./pnpm-lock.yaml ./

WORKDIR /app/packages/server

# Install packages
RUN npm i -g pnpm; \
    pnpm install
