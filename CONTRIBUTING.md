# Contributing to LogChimp

Thank you for showing an interest in contributing to LogChimp! All kinds on contributions are valuable to us.

If you're a developer looking to contribute but aren't sure where to start, check out the [good first issue](https://github.com/logchimp/logchimp/labels/good%20first%20issue) label on GitHub. It contains small tasks suitable for new contributors. Or, if you're seeking something more challenging, explore the broader [help wanted](https://github.com/logchimp/logchimp/labels/help%20wanted) label, which includes issues that might pique your interest.

## Directory structure

The repository is a monorepo, with backend APIs and frontend in a single repository.

```
packages
 ├── server
 ├── theme
 └── types
```

## Getting Started

We will cover how you can quickly run LogChimp and make your first contribution.

Please make sure you've enough hardware resources (Memory, CPU, Disk Space) to run the application on your machine or use cloud environments like GitHub Spaces

1. [Docker](#1-docker)
2. [GitHub CodeSpaces](#2-github-codespaces)

### 1. Docker

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

_We're still trying to figure out how to automate this step._

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

### 2. GitHub CodeSpaces

There are no prerequisites for software or hardware requirements except for the Web Browser.

Once you run the CodeSpaces and the whole setup is complete.

If opening inside VSCode, open the command (`Ctrl` / `Command` + `Shift` + `P`), type `Tasks: Run Task` and hit enter, you will find the task in the list `LogChimp Theme Dev` and hit enter.

## Other Ways to Help

While the primary means of contributing to LogChimp is through coding, there are still ways you can help even if you're not a developer. We always need help with:

- Maintaining [LogChimp Docs](https://docs.logchimp.codecarrot.net)
- Testing and quality assurance
- Promoting LogChimp to others
