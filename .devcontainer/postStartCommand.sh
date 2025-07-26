#!/usr/bin/env bash

pnpm i;

# Boot-up db and mail services
docker-compose -f ./docker-compose.dev.yml \
  up -d db mail

# Wait for the database to be ready
wait4x -t 60 -s localhost:5432 \
  # Start the API service
  exec 'docker-compose -f ./docker-compose.dev.yml up -d logchimp'
