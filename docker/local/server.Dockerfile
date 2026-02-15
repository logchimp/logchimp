FROM node:22-bullseye

# Install Go and air
RUN apt-get update && apt-get install -y wget && \
    wget https://go.dev/dl/go1.24.5.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go1.24.5.linux-amd64.tar.gz && \
    rm go1.24.5.linux-amd64.tar.gz

ENV PATH=$PATH:/usr/local/go/bin:/root/go/bin

# Install air
RUN go version
RUN go install github.com/air-verse/air@latest;

WORKDIR /app
COPY ./packages/types/ ./packages/types/
COPY ./packages/server/ ./packages/server/
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./

ENV NODE_ENV=development

RUN \
    npm i -g pnpm && \
    pnpm install && \
    chmod +x ./packages/server/scripts/*.sh

WORKDIR /app/packages/server

CMD ["sh", "docker-dev-entrypoint.sh"]
