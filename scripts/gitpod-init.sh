#!/bin/bash

# Create postgresql database
psql -c "CREATE DATABASE logchimp"

# Install packages
yarn install
