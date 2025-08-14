# Contributing to LogChimp

Thank you for showing an interest in contributing to LogChimp! All kinds on contributions are valuable to us. In this guide, we will cover how you can quickly onboard and make your first contribution.

## Directory structure

The repository is a monorepo, with backend APIs and frontend in a single repository.

```
packages
 ├── server
 ├── theme
 └── types
```

Please make sure you've enough hardware resources (Memory, CPU, Disk Space) to run the application on your machine or use cloud environments like GitHub Spaces

1. [Docker](#1-docker)
2. [GitHub CodeSpaces](#2-github-codespaces)

## 1. Docker

#### Setup the project

1. Clone the repository

```shell
git clone git@github.com:logchimp/logchimp.git <folder-name>
cd <folder-name>
```

2. Prep the `.env` files

Run this command from the root directory.

```shell
cp ./packages/server/.env.example ./packages/server/.env; \
  cp ./packages/theme/.env.example ./packages/theme/.env
```

3. Build the LogChimp Types package

_We're still trying to figure out to automate this step.

```shell
pnpm --filter="@logchimp/types" build
```

4. Start the Docker containers

Run this command from the root directory.

```shell
docker compose -f ./docker-compose.dev.yml up -d
```

5. Start the LogChimp theme

If opening inside VSCode, open the command (`Ctrl` / `Command` + `Shift` + `P`), type `Tasks: Run Task` and hit enter, you will find the task in the list `LogChimp Theme Dev` and hit enter.

Or, you can run it manually 

```shell
cd ./packages/theme
pnpm dev
```

## 2. GitHub CodeSpaces

There are no prerequisites for software or hardware requirements except for the Web Browser.

Once you run the CodeSpaces and the whole setup is complete.

If opening inside VSCode, open the command (`Ctrl` / `Command` + `Shift` + `P`), type `Tasks: Run Task` and hit enter, you will find the task in the list `LogChimp Theme Dev` and hit enter.
