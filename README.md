<a href="https://logchimp.codecarrot.net/">
  <img src="./.github/images/readme.png" alt="LogChimp logo" />
</a>

<br /><br />

<p align="center">
  Track your customers’ feedback to build better products with LogChimp
</p>

<h4 align="center">
  <a href="https://logchimp.codecarrot.net">Website</a>
  <span> • </span>
  <a href="https://logchimp.codecarrot.net/docs/">Docs</a>
  <span> • </span>
  <a href="https://logchimp.codecarrot.net/guide">Guide</a>
  <span> • </span>
  <a href="https://logchimp.codecarrot.net/docs/contributing">Contribute</a>
</h4>

<br />

<p align="center">
  <a href="https://github.com/logchimp/logchimp/actions">
    <img src="https://github.com/logchimp/logchimp/workflows/Test/badge.svg" alt="CI Test Status" />
  </a>
  <a href="https://github.com/logchimp/logchimp/contributors">
    <img src="https://img.shields.io/github/contributors/logchimp/logchimp.svg" alt="GitHub Contributors" />
  </a>
  <a href="https://gitpod.io/#https://github.com/logchimp/logchimp">
    <img src="https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod" alt="Gitpod Ready" />
  </a>
  <a href="https://opencollective.com/logchimp">
    <img src="https://img.shields.io/badge/contribute-Open%20Collective-7FADF2?logo=open-collective" alt="Support via Open Collective" />
  </a>
  <a href="https://github.com/logchimp/logchimp/stargazers">
    <img src="https://img.shields.io/github/stars/logchimp/logchimp" alt="GitHub Stars" />
  </a>
  <a href="https://discord.gg/A7mztcC">
    <img src="https://img.shields.io/discord/620800582722256899" alt="Join Discord" />
  </a>
  <a href="https://github.com/logchimp/logchimp/labels/help%20wanted">
    <img src="https://img.shields.io/badge/Help%20Wanted-Contribute-blue" alt="Help Wanted" />
  </a>
  <a href="https://twitter.com/logchimp">
    <img src="https://img.shields.io/twitter/follow/logchimp?style=flat" alt="Follow @logchimp" />
  </a>
  <a href="https://github.com/codespaces/new?repo=logchimp/logchimp">
    <img src="https://github.com/codespaces/badge.svg" alt="Open in GitHub Codespaces" />
  </a>
</p>

## Features

- 🎨 Brand customizable  
- 📝 Create posts  
- 🗃️ Organize posts by Boards & Roadmaps  
- 💪 Powerful dashboard  
- 🔐 Secure by design  
- 🤖 Self-hosted  

## Getting Started

To get started, choose one:

- **Self-hosting**: Read our [Ubuntu production guide](https://logchimp.codecarrot.net/docs/install/ubuntu) or [source installation guide](https://logchimp.codecarrot.net/docs/install/source).  
- **Cloud hosting**: One-click deploy via Railway, Render, or DigitalOcean.

---

## Development Setup

Follow these steps to run LogChimp locally:

### Prerequisites

- Node.js v22.x  
- pnpm  
- PostgreSQL v12+

### Clone & Install

git clone https://github.com/logchimp/logchimp.git
cd logchimp
pnpm install

### Database

Run PostgreSQL (example via Docker):

docker run -d
--name logchimp-db
-e POSTGRES_DB=logchimp
-e POSTGRES_USER=lc
-e POSTGRES_PASSWORD=password
-v logchimp_db_data:/var/lib/postgresql/data
postgres:12


Copy and edit the server `.env`:

cp packages/server/.env.example packages/server/.env

Update DB credentials and LOGCHIMP_SECRET_KEY


### Run Locally

Open two terminals:

Terminal 1: API
pnpm server:dev

Terminal 2: Theme
cd packages/theme
pnpm dev


API: http://localhost:3000  
Theme: http://localhost:5173

---

## ⛏️ Built Using

- **Express** – APIs  
- **PostgreSQL** – Database  
- **Vue 3** + **Vite.js** – Frontend  

---

## 🤝🏻 Community

Stay connected:

- ⭐️ Star us on GitHub  
- 🐦 Follow [@logchimp](https://twitter.com/logchimp)  
- 💬 Join the [LogChimp Discord](https://discord.gg/A7mztcC)

---

## 🎁 Sponsors

Big thanks to our [sponsors and partners](https://logchimp.codecarrot.net/partners).  
Interested in sponsoring? Reach out on [Discord](https://discord.gg/A7mztcC).

---

## Contributing

We welcome contributions of all kinds! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Reporting issues  
- Submitting pull requests  
- Coding standards  

---

## License

Licensed under the MIT License. See [LICENSE](LICENSE) for details.


