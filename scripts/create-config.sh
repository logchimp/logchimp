#!/bin/bash

echo "{
	\"database\": {
    \"host\": \"$PG_HOST\",
    \"user\": \"$PG_USER\",
    \"password\": \"$PG_PASSWORD\",
    \"name\": \"$PG_DATABASE\",
    \"port\": $PG_PORT,
    \"ssl\": false
  },
  \"server\": {
    \"secretKey\": \"$SECRET_KEY\"
  }
}" > logchimp.config.json
