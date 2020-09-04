
RUN \
	echo "Node version"; \
	node --version; \
	echo "Install Yarn globally"; \
	npm install -g yarn; \
	echo "Yarn version"; \
	yarn --version;
FROM node:12.18.3

WORKDIR /home/logchimp
RUN yarn install
ENTRYPOINT [ "/bin/bash" ]
