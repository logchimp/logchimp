FROM gitpod/workspace-postgres

RUN npm install -g maildev
RUN maildev
