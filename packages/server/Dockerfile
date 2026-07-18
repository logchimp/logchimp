FROM node:22-alpine AS builder

WORKDIR /app

COPY ./packages/types/package.json ./packages/types/package.json
COPY ./packages/server/package.json ./packages/server/package.json
COPY ./packages/email-templates/package.json ./packages/email-templates/package.json
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./

RUN \
    npm i -g pnpm && \
    pnpm install --frozen-lockfile --prod=false;

COPY ./packages/types ./packages/types/
COPY ./packages/server ./packages/server/
COPY ./packages/email-templates ./packages/email-templates/

RUN \
    pnpm --filter="@logchimp/types" build; \
    pnpm --filter="@logchimp/api" exec pnpm tsc; \
    pnpm --filter="@logchimp/email-templates" build;

FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/packages/types/package.json ./packages/types/package.json
COPY --from=builder /app/packages/server/package.json ./packages/server/package.json
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/scripts ./packages/server/scripts

# Copy raw email templates
COPY --from=builder /app/packages/email-templates/dist/** ./packages/server/dist/services/mail/templates

RUN \
    npm i -g pnpm && \
    pnpm install --filter="@logchimp/api" && \
    chmod +x ./packages/server/scripts/*.sh

WORKDIR /app/packages/server

CMD ["./scripts/docker-entrypoint.sh"]
