FROM node:22-bullseye

WORKDIR /app
COPY ./packages/server/ ./packages/server/
COPY ./package.json ./pnpm-lock.yaml ./

WORKDIR /app/packages/server

ENV NODE_ENV=development

RUN \
    npm i -g pnpm; \
    pnpm install
