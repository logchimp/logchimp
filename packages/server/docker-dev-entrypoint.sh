#!/bin/zsh bash

set -e

# Build @logchimp/types
pnpm --filter="@logchimp/types" build

# Seed system roles and permissions
pnpm ts-node ./src/ee/services/roles/system.ts

# Run Node dev server using air CLI
exec air -c .air.toml
