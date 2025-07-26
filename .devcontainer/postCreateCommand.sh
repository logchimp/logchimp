#!/bin/bash

LC_SECRET=$(openssl rand -base64 12)

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
set_env_var "VITE_API_URL" "http://localhost:8000" "packages/theme/.env"




# Install Wait4X CLI
curl -LO https://github.com/wait4x/wait4x/releases/latest/download/wait4x-linux-amd64.tar.gz
tar -xf wait4x-linux-amd64.tar.gz -C /tmp
sudo mv /tmp/wait4x-linux-amd64/wait4x /usr/local/bin/

