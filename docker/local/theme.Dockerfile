FROM node:22-bullseye AS dev

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/theme ./packages/theme

ENV NODE_ENV=development

RUN \
  npm i -g pnpm@11.25.0 && \
  pnpm install

WORKDIR /app/packages/theme

ENTRYPOINT ["node_modules/.bin/vite", "dev"]
