# Contributing to LogChimp

Thanks for your interest in contributing to LogChimp! Every contribution matters, whether it's fixing bugs, improving the UI, updating documentation, or suggesting new features. This guide will help you get started and make your first contribution quickly.

## Project Overview

LogChimp is a monorepo, which means the backend and frontend are in the same repository:

```
packages
├── server    # Backend APIs
├── theme     # Frontend application
└── types     # Shared TypeScript types
```

Ensure your machine has enough resources, like CPU, RAM, and disk space, to run the project locally. If not, you can use cloud environments such as GitHub Codespaces.

## Prerequisites

Before you begin, make sure you have these installed:

* Node.js v18+
* pnpm (package manager) - npm install -g pnpm
* Docker Desktop (for local development)
* VSCode (optional, but recommended)

## Development Setup

### 1. Docker Setup (Local Development)

#### Setup the project

1. Clone the repository

```shell
git clone git@github.com:logchimp/logchimp.git <folder-name>
cd <folder-name>
```

2. Prepare the `.env` files

Run this command from the root directory.

```shell
cp ./packages/server/.env.example ./packages/server/.env; \
  cp ./packages/theme/.env.example ./packages/theme/.env
```

3. Run this command from the root directory:

```shell
docker compose -f ./docker-compose.dev.yml up -d
```

4. Start the LogChimp theme:

If you are using VSCode, press `Ctrl` / `Command` + `Shift` + `P`, type `Tasks: Run Task`, and press enter. You will see `LogChimp Theme Dev` in the list. Select it and press enter.

Alternatively, you can run it manually:

```shell
cd ./packages/theme
pnpm dev
```

### 2. GitHub Codespaces

You only need a web browser.

Once the Codespace setup is complete:

If you are using VSCode, press `Ctrl` / `Command` + `Shift` + `P`, type `Tasks: Run Task`, and press enter. You will see `LogChimp Theme Dev` in the list. Select it and press enter.

## Next Steps

After the project is running, you can start exploring:

- Frontend: `packages/theme`
- Backend: `packages/server`
- Shared types: `packages/types`