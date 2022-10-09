#!/bin/bash

# Create postgresql database
psql -c "CREATE DATABASE logchimp"

# Create logchimp.config.json file
PG_DATABASE="logchimp" \
PG_HOST="localhost" \
PG_USER="gitpod" \
PG_PASSWORD="" \
PG_PORT=5432 \
THEME_STANDALONE="true" \
SECRET_KEY="privateSecretKey" \
MAIL_SERVICE="maildev" \
MAIL_HOST="localhost" \
MAIL_USER="gitpod" \
MAIL_PORT=1025 \
sh ./scripts/create-config.sh
