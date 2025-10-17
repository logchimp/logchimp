import * as path from "path";
import * as fs from "fs";
import type { IAuthLoginResponseBody, IAuthSignupResponseBody, IAuthUser } from "@logchimp/types";
import { request, test as baseTest } from "@playwright/test";

import { userLogin, userSignup } from "../helpers/api";

export const test = baseTest.extend({
  storageState: async ({ baseURL, browser }, use, testInfo) => {
    const fileName = path.join(
      testInfo.project.outputDir,
      `storage-owner-account.json`,
    );

    async function writeStorageWithUser(user: IAuthUser) {
      // open a real browser context so Playwright can capture localStorage
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(baseURL);

      // Store the auth user in localStorage (app reads from this key)
      await page.evaluate((payload: IAuthUser) => {
        localStorage.setItem("user", JSON.stringify(payload));
      }, user);

      await context.storageState({ path: fileName });
      await context.close();

      // Augment storage file with metadata.email for future logins
      try {
        const raw = fs.readFileSync(fileName, "utf8");
        const json = JSON.parse(raw);
        json.metadata = { ...(json.metadata || {}), email: user.email };
        fs.writeFileSync(fileName, JSON.stringify(json, null, 2), "utf8");
      } catch (e) {
        console.warn("Failed to write metadata to storage file", e);
      }
    }

    if (!fs.existsSync(fileName)) {
      const requestContext = await request.newContext();

      const res = await userSignup({
        requestContext,
        baseURL,
        isOwner: true,
      });

      let body: any = null;
      try {
        body = await res.json();
      } catch (_e) {}

      // Case 1: Owner account created
      if (res.status() === 201 && body && (body as IAuthSignupResponseBody).user) {
        const { user } = body as IAuthSignupResponseBody;
        await writeStorageWithUser(user);
      } else if (body && body.code === "SETUP_COMPLETED") {
        // Case 2: Setup already completed -> login to existing owner account
        let emailFromStorage: string | undefined;
        if (fs.existsSync(fileName)) {
          try {
            const saved = JSON.parse(fs.readFileSync(fileName, "utf8"));
            emailFromStorage = saved?.metadata?.email;
          } catch (_e) {}
        }

        const email = emailFromStorage || process.env.LOGCHIMP_OWNER_EMAIL;
        const password = process.env.LOGCHIMP_OWNER_PASSWORD || "password";

        if (!email) {
          throw new Error(
            "Site setup is already completed but no owner credentials are available. Provide LOGCHIMP_OWNER_EMAIL/LOGCHIMP_OWNER_PASSWORD or ensure storage file exists.",
          );
        }

        const loginRes = await userLogin({
          requestContext,
          baseURL,
          email,
          password,
        });

        if (!loginRes.ok()) {
          throw new Error(`Login failed with status ${loginRes.status()}`);
        }

        const loginBody = (await loginRes.json()) as IAuthLoginResponseBody;
        await writeStorageWithUser(loginBody.user);
      } else {
        throw new Error(
          `Owner setup failed with status ${res.status()}: ${JSON.stringify(body)}`,
        );
      }

      await requestContext.dispose();
    }

    await use(fileName);
  },
});
