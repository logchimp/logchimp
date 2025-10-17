import * as path from "path";
import * as fs from "fs";
import type { IAuthSignupResponseBody, IAuthUser } from "@logchimp/types";
import { request, test as baseTest } from "@playwright/test";

import { userSignup } from "../helpers/api";

export const test = baseTest.extend({
  storageState: async ({ baseURL, browser }, use, testInfo) => {
    const fileName = path.join(
      testInfo.project.outputDir,
      `storage-user-account-${testInfo.parallelIndex}.json`,
    );

    if (!fs.existsSync(fileName)) {
      const requestContext = await request.newContext();
      const res = await userSignup({
        requestContext,
        baseURL,
      });
      console.log("res status:", res.status());
      const body = (await res.json()) as IAuthSignupResponseBody;

      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(baseURL);

      // Store the auth user in localStorage (or use cookies/sessionStorage based on your app)
      await page.evaluate((payload: IAuthUser) => {
        localStorage.setItem("user", JSON.stringify(payload));
      }, body.user);

      await context.storageState({ path: fileName });
      await context.close();
      await requestContext.dispose();
    }

    await use(fileName);
  },
});
