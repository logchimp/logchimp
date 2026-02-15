FROM node:22-alpine AS builder

WORKDIR /app

COPY ./packages/types/package.json ./packages/types/package.json
COPY ./packages/server/package.json ./packages/server/package.json
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./

RUN \
    npm i -g pnpm && \
    pnpm install --frozen-lockfile --prod=false;

COPY ./packages/types ./packages/types/
COPY ./packages/server ./packages/server/

RUN \
    pnpm --filter="@logchimp/types" build; \
    pnpm --filter="@logchimp/api" exec pnpm tsc;

FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/packages/types/package.json ./packages/types/package.json
COPY --from=builder /app/packages/server/package.json ./packages/server/package.json
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/scripts ./packages/server/scripts

# Copy raw email templates
COPY --from=builder /app/packages/server/src/services/mail/templates ./packages/server/dist/services/mail/templates

RUN \
    npm i -g pnpm && \
    pnpm install --filter="@logchimp/api" && \
    chmod +x ./packages/server/scripts/*.sh

WORKDIR /app/packages/server

CMD ["node", "./dist/index.js"]
