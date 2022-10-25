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

    const urlObject = new URL(url);
    const passwordResetMailContent = await generateContent("reset", {
      url: urlObject.origin,
      domain: urlObject.host,
      resetLink: `${urlObject.origin}/password-reset/confirm/?token=${token}`,
    });

    const noReplyEmail = `noreply@${urlObject.host}`;

    await mail.sendMail({
      from: noReplyEmail,
      to: tokenPayload.email,
      subject: "Reset your LogChimp password",
      text: passwordResetMailContent.text,
      html: passwordResetMailContent.html,
    });

    return insertPasswordResetToken[0];
  } catch (err) {
    logger.error(err);
  }
};

module.exports = passwordReset;
