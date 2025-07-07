FROM node:16-alpine

WORKDIR /app
COPY ./packages/server/ ./packages/server/
COPY ./package.json ./pnpm-lock.yaml ./

WORKDIR /app/packages/server

RUN \
    npm i -g pnpm@8; \
    pnpm install
