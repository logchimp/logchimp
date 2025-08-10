server-integration-test:
	cd ./packages/server; \
	if command -v pnpm >/dev/null 2>&1; then \
		pnpm_cmd="pnpm"; \
	else \
		pnpm_cmd="pkgx +nodejs.org@22 +pnpm.io pnpm"; \
	fi && \
	LOGCHIMP_DB_HOST=localhost \
	LOGCHIMP_DB_DATABASE=db \
    LOGCHIMP_DB_PORT=5432 \
    LOGCHIMP_DB_USER=lc \
    LOGCHIMP_DB_PASSWORD=password \
    $$pnpm_cmd vitest \
		--config ./vitest.config.integration.ts \
		./tests/integration/base.spec.js
