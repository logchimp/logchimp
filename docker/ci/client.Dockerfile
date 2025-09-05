FROM node:22-alpine

WORKDIR /app

RUN npm i -g pnpm wait-on

COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./
COPY ./packages/theme ./packages/theme

RUN pnpm install --frozen-lockfile

RUN pnpm --filter="@logchimp/types" build && \
  pnpm --filter="@logchimp/theme" exec pnpm vite build;

WORKDIR /app/packages/theme

ENTRYPOINT ["pnpm", "vite", "preview", "--port", "3000", "--host"]
