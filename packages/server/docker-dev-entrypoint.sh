#!/bin/zsh bash

set -e

# Seed system roles and permissions
pnpm ts-node ./src/ee/services/roles/system.ts

# Run Node dev server
# `--legacy-watch` forces polling: inotify events don't propagate reliably
# across the Docker bind mount, so host file edits wouldn't trigger a restart.
exec pnpm nodemon --legacy-watch
