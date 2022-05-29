#!/bin/bash

FILE="{\n"

##########
# Database
##########

# set default postgresql port
if [ -z "$PG_PORT" ]; then
	PG_PORT=5432
fi

# set ssl default to false
if [ -z "$PG_SSL" ]; then
	PG_SSL=false
fi

if [ -n "$PG_HOST" ] && [ -n "$PG_USER" ] && [ -n "$PG_DATABASE" ] && [ $PG_PORT -ne 0 ] && [ -n "$PG_SSL" ]; then
	FILE="$FILE
	\t\"database\": {\n
    \t\t\"host\": \"$PG_HOST\",\n
    \t\t\"user\": \"$PG_USER\",\n
    \t\t\"password\": \"$PG_PASSWORD\",\n
    \t\t\"name\": \"$PG_DATABASE\",\n
    \t\t\"port\": $PG_PORT,\n
    \t\t\"ssl\": $PG_SSL\n
  \t}"
fi

##########
# Theme
##########
if [ -n "$THEME_STANDALONE" ]; then
	FILE="$FILE,\n
	\t\"theme\": {\n
		\t\t\"standalone\": \"$THEME_STANDALONE\"\n
	\t},"
fi

##########
# Server
##########

# set default server port
if [ -z "$SERVER_PORT" ]; then
	SERVER_PORT=3000
fi

if [ $SERVER_PORT -ne 0 ] && [ -n "$SECRET_KEY" ]; then
	FILE="$FILE\n
  \t\"server\": {\n
		\t\t\"port\": $SERVER_PORT,\n
    \t\t\"secretKey\": \"$SECRET_KEY\"\n
  \t}"
fi

##########
# Mail
##########

# set default mail server port
if [ -z "$MAIL_PORT" ]; then
	MAIL_PORT=587
fi

if [ -n "$MAIL_SERVICE" ] && [ -n "$MAIL_HOST" ] && [ -n "$MAIL_USER" ] && [ $MAIL_PORT -ne 0 ]; then
	FILE="$FILE,\n
	\t\"mail\": {\n
		\t\t\"service\": \"$MAIL_SERVICE\",\n
		\t\t\"host\": \"$MAIL_HOST\",\n
		\t\t\"user\": \"$MAIL_USER\",\n
		\t\t\"password\": \"$MAIL_PASSWORD\",\n
		\t\t\"port\": $MAIL_PORT\n
	\t}"
fi

FILE="$FILE\n}"

echo $FILE > logchimp.config.json
