import type { TEmailVerification, TResetPassword } from "@logchimp/types";

import type {
  IPasswordResetJwtPayload,
  IVerifyEmailJwtPayload,
} from "../../types";
import { createToken } from "../token.service";
import database from "../../database";
import { generateContent } from "./generateContent";
import type { EmailAccountVerification, EmailPasswordReset } from "./types";
import { mail } from "./mail";
import { configManager } from "../../utils/logchimpConfig";

const config = configManager.getConfig();

export async function sendPasswordResetTokenMail(
  tokenPayload: IPasswordResetJwtPayload,
) {
  const token = createToken(tokenPayload, {
    expiresIn: "2h",
  });

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
  let brandColor = siteInfo[0].accentColor;
  const siteLogo =
    siteInfo[0].logo ||
    "https://cdn.logchimp.codecarrot.net/logchimp_circular_logo.png";

  if (brandColor && !brandColor.startsWith("#")) {
    brandColor = `#${brandColor}`;
  }

  const urlObject = new URL(config.webUrl);
  const passwordResetMailContent = await generateContent<EmailPasswordReset>(
    "auth/email-password-reset",
    {
      recipientEmail: tokenPayload.email,
      url: urlObject.origin,
      domain: urlObject.host,
      resetLink: `${urlObject.origin}/password-reset/confirm/?token=${token}`,
      siteTitle,
      brandColor,
      siteLogo,
    },
  );

  const noReplyEmail = `noreply@${urlObject.hostname}`;

  await mail.sendMail({
    from: noReplyEmail,
    to: tokenPayload.email,
    subject: `${siteTitle} - Reset your account password`,
    text: passwordResetMailContent.text,
    html: passwordResetMailContent.html,
  });

  return insertPasswordResetToken[0];
}

export async function sendAccountVerificationEmail(
  tokenPayload: IVerifyEmailJwtPayload,
) {
  const token = createToken(tokenPayload, {
    expiresIn: "2h",
  });

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
  let brandColor = siteInfo[0].accentColor;
  const siteLogo =
    siteInfo[0].logo ||
    "https://cdn.logchimp.codecarrot.net/logchimp_circular_logo.png";

  if (brandColor && !brandColor.startsWith("#")) {
    brandColor = `#${brandColor}`;
  }

  const urlObject = new URL(config.webUrl);
  const onboardingMailContent = await generateContent<EmailAccountVerification>(
    "auth/email-account-verification",
    {
      recipientEmail: tokenPayload.email,
      url: urlObject.origin,
      domain: urlObject.hostname,
      verificationLink: `${urlObject.origin}/email-verify/?token=${token}`,
      siteTitle,
      brandColor,
      siteLogo,
    },
  );

  const noReplyEmail = `noreply@${urlObject.hostname}`;

  await mail.sendMail({
    from: noReplyEmail,
    to: tokenPayload.email,
    subject: `${siteTitle} - Please confirm your email`,
    text: onboardingMailContent.text,
    html: onboardingMailContent.html,
  });

  return userEmailVerificationToken[0];
}
