FROM node:22-alpine

WORKDIR /app

COPY . .

WORKDIR /app/packages/server

RUN \
    npm i -g pnpm; \
    pnpm install --frozen-lockfile;

ENTRYPOINT ["node", "index.js"]
