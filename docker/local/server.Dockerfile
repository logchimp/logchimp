FROM node:22-bullseye

WORKDIR /app
COPY ./packages/server/ ./packages/server/
COPY ./packages/email-templates/ ./packages/email-templates/
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./

ENV NODE_ENV=development

RUN \
    npm i -g pnpm@latest-12 && \
    pnpm install && \
    chmod +x ./packages/server/scripts/*.sh

WORKDIR /app/packages/server
