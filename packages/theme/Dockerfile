FROM node:22-alpine AS build-stage

WORKDIR /app

COPY . .

RUN \
    npm i -g pnpm && \
    pnpm install --frozen-lockfile --prod=false && \
    pnpm --filter="@logchimp/types" exec pnpm build && \
    # TODO: use pnpm build script which does typescript check
    pnpm --filter="@logchimp/theme" exec pnpm vite build;

FROM caddy:latest

WORKDIR /app

COPY ./packages/theme/Caddyfile ./Caddyfile

RUN caddy fmt Caddyfile --overwrite

COPY --from=build-stage /app/packages/theme/dist ./dist

# Inject app env
COPY --from=build-stage /app/packages/theme/inject-app-env.sh .
RUN chmod +x /app/inject-app-env.sh
ENTRYPOINT [ "/app/inject-app-env.sh" ]

# Expose the port the app runs on
EXPOSE 3000

CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
