#!/bin/sh
set -e

# ------------------------
# Database migrations
# ------------------------

# Default path set to production
CONFIG_PATH="dist/database/config.js"

if [ "$NODE_ENV" = "development" ]
then
  CONFIG_PATH="src/database/config.ts"
  echo "Using development config: $CONFIG_PATH"
else
  echo "Using production config: $CONFIG_PATH"
fi

echo '=> Starting: Database migration' && \
  pnpm knex --knexfile ./$CONFIG_PATH migrate:latest && \
  echo '=> Completed: Database migration'

# ------------------------
# Seed system roles
# ------------------------

SYSTEM_ROLE_FILE_BASE_PATH="ee/services/roles/system"

echo '=> Starting: Seeding system roles and permissions'

if [ "$NODE_ENV" = "development" ]
then
  echo "Seeding in development env"
  pnpm ts-node src/$SYSTEM_ROLE_FILE_BASE_PATH.ts
else
  echo "Seeding in production env"
  node dist/$SYSTEM_ROLE_FILE_BASE_PATH.js
fi

echo '=> Completed: Seeding system roles and permissions'