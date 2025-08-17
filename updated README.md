--- a/README.md
+++ b/README.md
@@ -1,6 +1,45 @@
 # LogChimp
 ...
 ## Getting started
-To get started you can read our deployment docs for self-hosting with Ubuntu or cloud hosting with one click deploy button.
+### Local Development (2 min)
+```bash
+# 1) Use repo's Node version
+nvm install && nvm use
+
+# 2) Install workspace deps
+corepack enable            # if needed on fresh Node
+pnpm -v || npm i -g pnpm
+pnpm install
+
+# 3) Bring up Postgres for dev
+docker compose -f docker-compose.dev.yml up -d
+
+# 4) Start dev servers (workspace root or package-level)
+pnpm -w dev
+
+# 5) Smoke test
+curl -s http://localhost:3000/health || echo "Start the API package per docs"
+```
+
+**Troubleshooting**
+- If Postgres isn't ready yet, compose healthcheck will retry automatically.
+- On Apple Silicon, Docker images may take longer on first pull.
+
+### Environment
+- Copy `.env.example` to `.env` and adjust values if needed.
+- All packages read standard `POSTGRES_*` vars in dev.
