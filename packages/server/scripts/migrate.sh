#!/bin/bash
set -e

pnpm knex --knexfile ./dist/database/config.js migrate:latest && \
  echo '=> Migration done'