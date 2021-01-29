#!/bin/bash

FILE="{\n"

##########
# Database
##########

# set default postgresql port
if [[ $PG_PORT = "" ]]; then
	PG_PORT=5432
fi

# set ssl default to false
if [[ $PG_SSL = "" ]]; then
	PG_SSL=false
fi

if [[ $PG_HOST != "" ]] && [[ $PG_USER != "" ]] && [[ $PG_DATABASE != "" ]] && [[ $PG_PORT != "" ]] && [[ $PG_SSL != "" ]]; then
	FILE="$FILE
	\t\"database\": {\n
    \t\t\"host\": \"$PG_HOST\",\n
    \t\t\"user\": \"$PG_USER\",\n
    \t\t\"password\": \"$PG_PASSWORD\",\n
    \t\t\"name\": \"$PG_DATABASE\",\n
    \t\t\"port\": $PG_PORT,\n
    \t\t\"ssl\": $PG_SSL\n
  \t},"
fi

##########
# Server
##########

# set default server port
if [[ $SERVER_PORT = "" ]]; then
	SERVER_PORT=3000
fi

if [[ $SERVER_PORT != "" ]] && [[ $SECRET_KEY != "" ]]; then
	FILE="$FILE\n
  \t\"server\": {\n
		\t\t\"port\": $SERVER_PORT,\n
    \t\t\"secretKey\": \"$SECRET_KEY\"\n
  \t},"
fi

##########
# Mail
##########

# set default mail server port
if [[ $MAIL_PORT = "" ]]; then
	MAIL_PORT=587
fi

if [[ $MAIL_SERVICE != "" ]] && [[ $MAIL_HOST != "" ]] && [[ $MAIL_USER != "" ]] && [[ $MAIL_PORT != "" ]]; then
	FILE="$FILE\n
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
