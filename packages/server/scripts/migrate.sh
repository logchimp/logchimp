#!/bin/sh
set -e

# Default path set to production
CONFIG_PATH="dist/database/config.js"

if [ "$NODE_ENV" = "development" ]
then
  CONFIG_PATH="src/database/config.ts"
  echo "Using development config: $CONFIG_PATH"
else
  echo "Using production config: $CONFIG_PATH"
fi

pnpm knex --knexfile ./$CONFIG_PATH migrate:latest && \
  echo '=> Migration done'