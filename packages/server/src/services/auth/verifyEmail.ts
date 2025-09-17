import type { TEmailVerification } from "@logchimp/types";
import database from "../../database";

// services
import { mail, generateContent } from "../mail";
import { createToken } from "../token.service";

// utils
import { configManager } from "../../utils/logchimpConfig";
import logger from "../../utils/logger";
import type { IVerifyEmailJwtPayload } from "../../types";

const config = configManager.getConfig();

export async function verifyEmail(
  tokenPayload: IVerifyEmailJwtPayload,
): Promise<TEmailVerification> {
  const token = createToken(tokenPayload, {
    expiresIn: "2h",
  });

  try {
    await database.delete().from("emailVerification").where({
      email: tokenPayload.email,
    });

    const userEmailVerificationToken = await database<TEmailVerification>(
      "emailVerification",
    )
      .insert({
        email: tokenPayload.email,
        token,
      })
      .returning("*");

    /**
     * Get site title for using it in email footer
     */
    const siteInfo = await database.select("title").from("settings");
    const siteTitle = siteInfo[0].title;

    const urlObject = new URL(config.webUrl);
    const onboardingMailContent = await generateContent("verify", {
      url: urlObject.origin,
      domain: urlObject.hostname,
      verificationLink: `${urlObject.origin}/email-verify/?token=${token}`,
      siteTitle,
    });

    const noReplyEmail = `noreply@${urlObject.hostname}`;

    await mail.sendMail({
      from: noReplyEmail,
      to: tokenPayload.email,
      subject: `${siteTitle} - Please confirm your email`,
      text: onboardingMailContent.text,
      html: onboardingMailContent.html,
    });

    return userEmailVerificationToken[0];
  } catch (err) {
    logger.error("failed to send email verification", err.message);
  }
}
