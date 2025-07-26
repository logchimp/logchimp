#!/bin/bash

LC_SECRET=$(openssl rand -base64 12)
GH_CS_PUBLIC_THEME_HOST="https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
GH_CS_PUBLIC_API_HOST="https://${CODESPACE_NAME}-8000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"

# helper function to write or replace .env vars
set_env_var() {
  local key="$1"
  local value="$2"
  local file="$3"

  # delete all existing line matching the key
  sed -i '' "/^${key}=.*/d" "$file"

  # insert the key
  echo "${key}=${value}" >> "$file"
}

# API (Server)
set_env_var "LOGCHIMP_SECRET_KEY" "$LC_SECRET" "packages/server/.env"

# Theme
set_env_var "VITE_API_URL" "$GH_CS_PUBLIC_THEME_HOST" "packages/theme/.env"
set_env_var "VITE_API_URL_PROXY" "$GH_CS_PUBLIC_API_HOST" "packages/theme/.env"
