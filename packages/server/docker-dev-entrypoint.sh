#!/bin/zsh bash

# Build @logchimp/types
pnpm --filter="@logchimp/types" build

# Run Node dev server using air CLI
air -c .air.toml
