#!/bin/bash

# helper function to generate random string
generate_random_string() {
  local length="$1"

  echo $(openssl rand -base64 $length | tr -dc 'a-zA-Z0-9' | cut -c1-$lenght)
}

# helper function to write or replace .env vars
set_env_var() {
  local key="$1"
  local value="$2"
  local file="$3"

  # delete all existing line matching the key
  sed -i "/^${key}=.*/d" "$file"

  # insert the key
  echo "${key}=\"${value}\"" >> "$file"
}

LC_SECRET=$(generate_random_string 12)
LOGCHIMP_MACHINE_SIGNATURE=$(generate_random_string 64)

cp ./packages/theme/.env.example ./packages/theme/.env

# API (Server)
set_env_var "LOGCHIMP_SECRET_KEY" "$LC_SECRET" "packages/server/.env"
set_env_var "LOGCHIMP_MACHINE_SIGNATURE" "$LOGCHIMP_MACHINE_SIGNATURE" "packages/server/.env"
set_env_var "LOGCHIMP_IS_SELF_HOSTED" "true" "packages/server/.env"
set_env_var "LOGCHIMP_WEB_URL" "http://localhost:3000" "packages/server/.env"

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
