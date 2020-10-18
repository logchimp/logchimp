#!/bin/bash

# Create postgresql database
psql -c "CREATE DATABASE logchimp"

# Install packages
yarn install

# Create logchimp.config.json file
PG_DATABASE="logchimp" \
PG_HOST="localhost" \
PG_USER="gitpod" \
PG_PASSWORD="" \
PG_PORT=5432 \
SECRET_KEY="privateSecretKey" \
sh ./scripts/create-config.sh
