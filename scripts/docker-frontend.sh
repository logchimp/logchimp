#!/bin/bash

# Install http-server & vue CLI package
yarn global add http-server

# server 'dist' folder on server
http-server ./dist -p 8080 -d false
