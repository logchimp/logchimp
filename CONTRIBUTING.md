# Contributing to LogChimp

Thank you for showing an interest in contributing to LogChimp! All kinds on contributions are valuable to us.

If you're a developer looking to contribute but aren't sure where to start, check out the [good first issue](https://github.com/logchimp/logchimp/labels/good%20first%20issue) label on GitHub. It contains small tasks suitable for new contributors. Or, if you're seeking something more challenging, explore the broader [help wanted](https://github.com/logchimp/logchimp/labels/help%20wanted) label, which includes issues that might pique your interest.
If in doubt, please open a [discussion](https://github.com/logchimp/logchimp/discussions); we can always convert that to an issue later.

**Table of Contents**

- [AI Usage](#ai-usage)
- [Directory structure](#directory-structure)
- [Getting Started](#getting-started)
- [Other ways to Help](#other-ways-to-help)

## AI Usage

The LogChimp project has strict rules for AI usage. Please see the [AI Usage Policy](./AI_POLICY.md). **This is very important**.

## Directory structure

The repository is a monorepo, with backend APIs and frontend in a single repository.

```
packages
 ├── e2e
 ├── server
 ├── theme
 └── types
```

Contributing guide for E2E docs can be read [here](packages/e2e/README.md).

## Getting Started

We will cover how you can quickly run LogChimp and make your first contribution.

Please make sure you've enough hardware resources (Memory, CPU, Disk Space) to run the application on your machine or use cloud environments like GitHub Spaces

1. [Docker](#1-docker)
2. [GitHub CodeSpaces](#2-github-codespaces)

### 1. Docker

To run this project locally.

1. Clone the repository

```shell
git clone git@github.com:logchimp/logchimp.git <folder-name>
cd <folder-name>
```

2. Setup Traefik

Traefik is used to manage the TLS certificates and the routing to the different services.

To make it work:

Generate some certs for TLS usage:

```shell
pkgx +certutil +mkcert mkcert -install
cd ./traefik
pkgx mkdir certs
cd certs
pkgx mkcert -cert-file logchimp.dev.pem -key-file logchimp.dev-key.pem logchimp.dev "*.logchimp.dev"
```

Add all custom domains to your `/etc/hosts` file:

```shell
# Start: Added for Logchimp
127.0.0.1   traefik.logchimp.dev
# Logchimp - Webapp
127.0.0.1   logchimp.dev
# Logchimp - API
127.0.0.1   api.logchimp.dev
# Logchimp - Mail
127.0.0.1   mail.logchimp.dev
127.0.0.1   bullmq-ui.logchimp.dev
127.0.0.1   oidc-mock.logchimp.dev
# End: Added for Logchimp
```

3. Prep the `.env` files

Run this command from the root directory.

```shell
cp ./packages/server/.env.example ./packages/server/.env; \
  cp ./packages/theme/.env.example ./packages/theme/.env; \
  cp ./packages/e2e/.env.example ./packages/e2e/.env
```

4. Start the Docker containers

Run this command from the root directory.

This will run the both API and the LogChimp theme inside Docker.

```shell
docker compose -f ./docker/local/docker-compose.dev.yml up -d
```

### 2. GitHub CodeSpaces

There are no prerequisites for software or hardware requirements except for the Web Browser.

Once you run the CodeSpaces and the whole setup is complete.

If opening inside VSCode, open the command (`Ctrl` / `Command` + `Shift` + `P`), type `Tasks: Run Task` and hit enter, you will find the task in the list `LogChimp Theme Dev` and hit enter.

## Other Ways to Help

While the primary means of contributing to LogChimp is through coding, there are still ways you can help even if you're not a developer. We always need help with:

- Maintaining [LogChimp Docs](https://docs.logchimp.codecarrot.net)
- Testing and quality assurance
- Promoting LogChimp to others

## Database

We use Knex ORM for integration with database and migrations.

We have a dedicated service called `migrator` in Docker Compose for running the database migrations.
