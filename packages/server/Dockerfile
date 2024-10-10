ARG NODE_VERSION=16
FROM node:${NODE_VERSION}-alpine

WORKDIR /app
COPY ./packages/server/ ./packages/server/
COPY ./package.json ./pnpm-lock.yaml ./

WORKDIR /app/packages/server

# Install packages
RUN npm i -g pnpm; \
    pnpm install
