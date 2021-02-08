#!/bin/bash

# Create postgresql database
psql -c "CREATE DATABASE logchimp"

# Create logchimp.config.json file
PG_DATABASE="logchimp" \
PG_HOST="localhost" \
PG_USER="gitpod" \
PG_PASSWORD="" \
PG_PORT=5432 \
SECRET_KEY="privateSecretKey" \
sh ./scripts/create-config.sh

# Install packages
yarn install

# Clone Logchimp default theme
git clone https://github.com/logchimp/theme.git
cd theme
yarn install
