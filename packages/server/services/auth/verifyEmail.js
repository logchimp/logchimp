// database
const database = require("../../database");

// services
const { mail, generateContent } = require("../../services/mail");
const { createToken } = require("../../services/token.service");

// utils
const logger = require("../../utils/logger");

const verifyEmail = async (url, tokenPayload) => {
  const token = createToken(tokenPayload, {
    expiresIn: "2h",
  });

  try {
    await database.delete().from("emailVerification").where({
      email: tokenPayload.email,
    });

    const userEmailVerificationToken = await database
      .insert({
        email: tokenPayload.email,
        token,
      })
      .into("emailVerification")
      .returning("*");

    /**
     * Get site title for using it in email footer
     */
    const siteInfo = await database.select("title").from("settings");
    const siteTitle = siteInfo[0].title;

    const urlObject = new URL(url);
    const onboardingMailContent = await generateContent("verify", {
      url: urlObject.origin,
      domain: urlObject.host,
      verificationLink: `${urlObject.origin}/email-verify/?token=${token}`,
      siteTitle,
    });

    const noReplyEmail = `noreply@${urlObject.host}`;

    await mail.sendMail({
      from: noReplyEmail,
      to: tokenPayload.email,
      subject: `${siteTitle} - Please confirm your email`,
      text: onboardingMailContent.text,
      html: onboardingMailContent.html,
    });

    return userEmailVerificationToken[0];
  } catch (err) {
    logger.error(err.message);
  }
};

module.exports = verifyEmail;
