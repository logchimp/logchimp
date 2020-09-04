FROM node:12.18.3

WORKDIR /home/logchimp
RUN npm install yarn && rm package-lock.json
COPY . .
RUN yarn install
ENTRYPOINT [ "/bin/bash" ]
