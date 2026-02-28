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
    const onboardingMailContent = await generateContent("verify", {
      url: urlObject.origin,
      domain: urlObject.hostname,
      verificationLink: `${urlObject.origin}/email-verify/?token=${token}`,
      siteTitle,
      siteColor,
      siteLogo,
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
