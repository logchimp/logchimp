#!/bin/bash

LC_SECRET=$(openssl rand -base64 12)

echo "LOGCHIMP_SECRET_KEY=$LC_SECRET" > packages/server/.env

echo "cs name: ${CODESPACE_NAME}"
echo "forward domain: ${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"

GH_CS_PUBLIC_HOST="https://${CODESPACE_NAME}-8000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"

echo "VITE_API_URL=$GH_CS_PUBLIC_HOST" >> packages/theme/.env
