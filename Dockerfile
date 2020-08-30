FROM node:12.18.3 AS builder

RUN \
	echo "Node version"; \
	node --version; \
	echo "Install Yarn globally"; \
	npm install -g yarn; \
	echo "Yarn version"; \
	yarn --version;

WORKDIR /home/logchimp
RUN yarn install

# Backend
FROM builder AS backend
CMD ["yarn", "run", "server:dev"]

# Frontend
FROM builder AS frontend
CMD ["yarn", "run" ,"frontend:dev"]
