#!/usr/bin/env bash

echo "Migration file name: $1"
knex migrate:make $1 --migrations-directory ./server/database/migrations
