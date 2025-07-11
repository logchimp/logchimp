FROM node:22-alpine

WORKDIR /app
COPY ./packages/server/ ./packages/server/
COPY ./package.json ./pnpm-lock.yaml ./

WORKDIR /app/packages/server

RUN \
    npm i -g pnpm; \
    pnpm install
