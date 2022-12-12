// database
const database = require("../../database");

// services
const { mail, generateContent } = require("../../services/mail");
const { createToken } = require("../../services/token.service");

// utils
const logger = require("../../utils/logger");

const passwordReset = async (url, tokenPayload) => {
  const token = createToken(tokenPayload, {
    expiresIn: "2h",
  });

  try {
    // remove existing resetPassword request
    await database.delete().from("resetPassword").where({
      email: tokenPayload.email,
    });

    const insertPasswordResetToken = await database
      .insert({
        email: tokenPayload.email,
        token,
      })
      .into("resetPassword")
      .returning("*");

    /**
     * Get site title for using it in email footer
     */
    const siteInfo = await database.select("title").from("settings");
    const siteTitle = siteInfo[0].title;

    const urlObject = new URL(url);
    const passwordResetMailContent = await generateContent("reset", {
      url: urlObject.origin,
      domain: urlObject.host,
      resetLink: `${urlObject.origin}/password-reset/confirm/?token=${token}`,
      siteTitle,
    });

    const noReplyEmail = `noreply@${urlObject.host}`;

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
};

module.exports = passwordReset;
