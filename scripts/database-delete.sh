#!/usr/bin/env bash

# environment variables
source ./scripts/variables.sh

echo
echo "Deleting all database tables"
echo

psql \
-c \
  "DROP TABLE IF EXISTS
    member,
    post,
    board,
    category,
    status
  ;" \
-d $PG_DATABASE \
-h $PG_HOST \
-p $PG_PORT \
-U $PG_USER
echo