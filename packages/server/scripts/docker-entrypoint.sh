#!/usr/bin/env sh

set -e

# Seed system roles and permissions
node ./dist/ee/services/roles/system.js

# Start server
node ./dist/index.js