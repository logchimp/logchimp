import type { TResetPassword } from "@logchimp/types";

import database from "../../database";

// services
import { mail, generateContent } from "../mail";
import { createToken } from "../token.service";

// utils
import { configManager } from "../../utils/logchimpConfig";
import logger from "../../utils/logger";
import type { IPasswordResetJwtPayload } from "../../types";

const config = configManager.getConfig();

export async function passwordReset(tokenPayload: IPasswordResetJwtPayload) {
  const token = createToken(tokenPayload, {
    expiresIn: "2h",
  });

  try {
    // remove existing resetPassword request
    await database.delete().from("resetPassword").where({
      email: tokenPayload.email,
    });

    const insertPasswordResetToken = await database<TResetPassword>(
      "resetPassword",
    )
      .insert({
        email: tokenPayload.email,
        token,
      })
      .returning("*");

    /**
     * Get site title for using it in email footer
     */
    const siteInfo = await database
      .select<
        Array<{
          title: string;
          accentColor: string;
          logo: string;
        }>
      >("title", "accentColor", "logo")
      .from("settings");

    if (siteInfo.length === 0) {
      throw new Error("Site settings not found");
    }

    const siteTitle = siteInfo[0].title;
    let siteColor = siteInfo[0].accentColor;
    const siteLogo =
      siteInfo[0].logo ||
      "https://cdn.logchimp.codecarrot.net/logchimp_circular_logo.png";

    if (siteColor && !siteColor.startsWith("#")) {
      siteColor = `#${siteColor}`;
    }

    const urlObject = new URL(config.webUrl);
    const passwordResetMailContent = await generateContent("reset", {
      url: urlObject.origin,
      domain: urlObject.host,
      resetLink: `${urlObject.origin}/password-reset/confirm/?token=${token}`,
      siteTitle,
      siteColor,
      siteLogo,
    });

    const noReplyEmail = `noreply@${urlObject.hostname}`;

    await mail.sendMail({
      from: noReplyEmail,
      to: tokenPayload.email,
      subject: `${siteTitle} - Reset your account password`,
      text: passwordResetMailContent.text,
      html: passwordResetMailContent.html,
    });

    return insertPasswordResetToken[0];
  } catch (err) {
    logger.error(err);
  }
}
