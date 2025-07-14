FROM node:22-alpine AS build-stage

WORKDIR /app

COPY . .

RUN \
    npm i -g pnpm && \
    pnpm install --frozen-lockfile --prod=false && \
    pnpm --filter="@logchimp/theme" exec pnpm vite build;

FROM caddy:latest

WORKDIR /app

COPY ./packages/theme/Caddyfile ./Caddyfile

RUN caddy fmt Caddyfile --overwrite

COPY --from=build-stage /app/packages/theme/dist ./dist

CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
