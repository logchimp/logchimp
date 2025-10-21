# End-to-End tests

E2E tests are written in Typescript with Playwright.

There are some test cases that are run on behind of **owner** account, you can use
`packages/e2e/fixtures/owner-account.ts` fixture.

**Behind the scenes**

- On first run, the fixture posts to `/api/v1/auth/setup` with required fields: `siteTitle`, `name`, `email`,
  `password`.
- When created (201), it writes the `user` object to localStorage and persists the storage state file, also storing
  `metadata.email` inside the file.
- If setup is already completed, it reads `metadata.email` from the storage file when present. If the storage file is
  missing, it falls back to `LOGCHIMP_OWNER_EMAIL`/`LOGCHIMP_OWNER_PASSWORD` to log in via `/api/v1/auth/login` and
  then persists a fresh storage state file.

In case you notice some issues with tests cases getting failed related to an owner account, you can set
`LOGCHIMP_OWNER_EMAIL` environment variable.
