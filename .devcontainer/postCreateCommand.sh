#!/bin/bash

LC_SECRET=$(openssl rand -base64 12)
LOGCHIMP_MACHINE_SIGNATURE=$(openssl rand -base64 64)

# helper function to write or replace .env vars
set_env_var() {
  local key="$1"
  local value="$2"
  local file="$3"

  # delete all existing line matching the key
  sed -i "/^${key}=.*/d" "$file"

  # insert the key
  echo "${key}=${value}" >> "$file"
}

# API (Server)
set_env_var "LOGCHIMP_SECRET_KEY" "$LC_SECRET" "packages/server/.env"
set_env_var "LOGCHIMP_MACHINE_SIGNATURE" "$LOGCHIMP_MACHINE_SIGNATURE" "packages/server/.env"
set_env_var "LOGCHIMP_IS_SELF_HOSTED" "true" "packages/server/.env"

# Theme
set_env_var "VITE_API_URL" "http://localhost:8000" "packages/theme/.env"
set_env_var "VITE_IS_SELF_HOSTED" "true" "packages/theme/.env"


#############################
# Wait4X
#############################

ARCHIVE="wait4x-linux-amd64.tar.gz"
DOWNLOAD_URL="https://github.com/wait4x/wait4x/releases/latest/download/${ARCHIVE}"

mkdir -p ./tmp
curl -sSL -o "$ARCHIVE" "$DOWNLOAD_URL"

tar -xf "$ARCHIVE" -C ./tmp
sudo mv ./tmp/wait4x /usr/local/bin/
rm -r ./tmp $ARCHIVE
