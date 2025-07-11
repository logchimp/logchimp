#!/bin/bash

LC_SECRET=$(openssl rand -base64 12)

echo "LOGCHIMP_SECRET_KEY=$LC_SECRET" > packages/server/.env