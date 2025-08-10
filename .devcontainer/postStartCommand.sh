#!/usr/bin/env bash

pnpm i;

# Build @logchimp/types package
pnpm --filter="@logchimp/types" build

# Boot-up db and mail services
docker-compose -f ./docker-compose.dev.yml \
  up -d db mail

# Wait for the database to be ready
if wait4x tcp localhost:5432 --timeout 60s; then
  echo "Database is ready, starting LogChimp API service..."
  docker-compose -f ./docker-compose.dev.yml up -d logchimp
else
  echo "Database did not start in time, exiting."
  exit 1
fi
