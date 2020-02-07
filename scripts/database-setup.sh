#!/usr/bin/env bash

# environment variables
source ./scripts/variables.sh

echo
echo "Creating database table"
echo

echo "==== member table ===="
psql \
-c \
  "CREATE TABLE IF NOT EXISTS member (
    member_id VARCHAR(80) PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    email_address VARCHAR(320) UNIQUE NOT NULL,
    password VARCHAR(72) NOT NULL,
    profile_picture TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_owner BOOLEAN DEFAULT false,
    is_moderator BOOLEAN DEFAULT false,
    is_blocked BOOLEAN DEFAULT false,
    created_at timestamp DEFAULT current_timestamp
  );" \
-d $PG_DATABASE \
-h $PG_HOST \
-p $PG_PORT \
-U $PG_USER
echo

echo "==== post table ===="
psql \
-c \
  "CREATE TABLE IF NOT EXISTS post (
    post_id VARCHAR(80) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    body_markdown TEXT,
    member_id VARCHAR(80) NOT NULL REFERENCES member(member_id),
    category_id VARCHAR(80) REFERENCES category(category_id),
    status_id VARCHAR(80) REFERENCES status(status_id),
    created_at timestamp DEFAULT current_timestamp,
    updated_at timestamp DEFAULT current_timestamp
  );" \
-d $PG_DATABASE \
-h $PG_HOST \
-p $PG_PORT \
-U $PG_USER
echo

echo "==== vote table ===="
psql \
-c \
  "CREATE TABLE IF NOT EXISTS vote (
    vote_id VARCHAR(80) PRIMARY KEY,
    post_id VARCHAR(100) NOT NULL,
    member_id VARCHAR(100) NOT NULL,
    created_at timestamp DEFAULT current_timestamp
  );" \
-d $PG_DATABASE \
-h $PG_HOST \
-p $PG_PORT \
-U $PG_USER
echo

echo "==== board table ===="
psql \
-c \
  "CREATE TABLE IF NOT EXISTS board (
    board_id VARCHAR(80) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    hex_color VARCHAR(6) NOT NULL,
    created_at timestamp DEFAULT current_timestamp
  );" \
-d $PG_DATABASE \
-h $PG_HOST \
-p $PG_PORT \
-U $PG_USER
echo

echo "==== category table ===="
psql \
-c \
  "CREATE TABLE IF NOT EXISTS category (
    category_id VARCHAR(80) PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    slug VARCHAR(30) NOT NULL,
    hex_color VARCHAR(6) NOT NULL,
    created_at timestamp DEFAULT current_timestamp
  );" \
-d $PG_DATABASE \
-h $PG_HOST \
-p $PG_PORT \
-U $PG_USER
echo

echo "==== status table ===="
psql \
-c \
  "CREATE TABLE IF NOT EXISTS status (
    status_id VARCHAR(80) PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    slug VARCHAR(30) NOT NULL,
    hex_color VARCHAR(6) NOT NULL,
    created_at timestamp DEFAULT current_timestamp
  );" \
-d $PG_DATABASE \
-h $PG_HOST \
-p $PG_PORT \
-U $PG_USER
echo

# insert default data to status table
# echo
# echo "Add default data to status table"
# echo

# echo "==== Default data to category ===="
# psql \
# -c \
#   "INSERT INTO
#     category
#       (category_id, name, slug, hex_color)
#   VALUES
#     (1, 'New', 'new', '3778ff'),
#     (2, 'Improvement', 'improvement', '11C63C'),
#     (3, 'Fix', 'fix', 'ff4772')
#   ;" \
# -d $PG_DATABASE \
# -h $PG_HOST \
# -p $PG_PORT \
# -U $PG_USER
# echo

# echo "==== Default data to status ===="
# psql \
# -c \
#   "INSERT INTO
#   status
#     (status_id, name, slug)
# VALUES
#   (1, 'Under Review', 'under-review'),
#   (2, 'Planned', 'planned'),
#   (3, 'In Progress', 'in-progress')
#   );" \
# -d $PG_DATABASE \
# -h $PG_HOST \
# -p $PG_PORT \
# -U $PG_USER
