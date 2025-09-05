FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /app

RUN npm i -g pnpm wait-on

COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./
COPY ./packages/types ./packages/types/
COPY ./packages/server ./packages/server/

RUN pnpm install --frozen-lockfile

RUN pnpm --filter="@logchimp/types" build && \
    pnpm --filter="@logchimp/api" exec pnpm tsc

RUN pnpm install --filter="@logchimp/api"

ENTRYPOINT ["node", "./packages/server/dist/index.js"]
