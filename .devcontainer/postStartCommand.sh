#!/usr/bin/env bash

pnpm i;

docker-compose -f ./docker-compose.dev.yml \
  up -d
