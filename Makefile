# Command detection helpers
PNPM_CMD := $(shell command -v pnpm >/dev/null 2>&1 && echo "pnpm" || echo "pkgx +nodejs.org@22 +pnpm.io pnpm")

server-integration-test:
	cd ./packages/server; \
	SKIP_EE_TESTS="false" \
	NODE_ENV="testing" \
	LOGCHIMP_SECRET_KEY="secret-key" \
	LOGCHIMP_WEB_URL="http://localhost:3000" \
	LOGCHIMP_DB_HOST=localhost \
	LOGCHIMP_DB_DATABASE=db \
    LOGCHIMP_DB_PORT=5432 \
    LOGCHIMP_DB_USER=lc \
    LOGCHIMP_DB_PASSWORD=password \
    LOGCHIMP_MAIL_HOST=localhost \
	LOGCHIMP_MAIL_PORT=1025 \
	LOGCHIMP_MAIL_USER=test \
	LOGCHIMP_MAIL_PASSWORD=test \
	LOGCHIMP_VALKEY_URL=localhost:6379 \
    $(PNPM_CMD) vitest run \
		--config ./vitest.config.integration.ts \
		./tests/integration/base.spec.js

playwright-ui:
	cd ./packages/e2e; \
	LOGCHIMP_OWNER_EMAIL="owner@example.com" \
	LOGCHIMP_API_URL="http://localhost:8000" \
	BASE_URL="http://localhost:3000" \
	$(PNPM_CMD) playwright test --ui
