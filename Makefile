server-integration-test:
	cd ./packages/server; \
	if command -v pnpm >/dev/null 2>&1; then \
		pnpm_cmd="pnpm"; \
	else \
		pnpm_cmd="pkgx +nodejs.org@22 +pnpm.io pnpm"; \
	fi && \
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
    $$pnpm_cmd vitest run \
		--config ./vitest.config.integration.ts \
		./tests/integration/base.spec.js
