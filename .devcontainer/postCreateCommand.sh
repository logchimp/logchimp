#!/usr/bin/env bash

docker-compose -f ./docker-compose.dev.yml \
  up -d

pnpm i;

cd ./packages/theme; pnpm dev;
