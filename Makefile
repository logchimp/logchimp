server-integration-test:
	cd ./packages/server; \
		LOGCHIMP_DB_HOST=localhost \
		pnpm vitest \
			--config ./vitest.config.integration.ts \
			./tests/integration/base.spec.js
