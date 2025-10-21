#!/bin/zsh bash

# Build @logchimp/types
pnpm --filter="@logchimp/types" build

# Run Node dev server using air CLI
exec air -c .air.toml
