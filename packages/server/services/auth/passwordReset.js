// database
const database = require("../../database");

// services
const { mail, generateContent } = require("../../services/mail");

// utils
const { createToken } = require("../../utils/token");
const logchimpConfig = require("../../utils/logchimpConfig");
const logger = require("../../utils/logger");
const config = logchimpConfig();

const passwordReset = async (url, tokenPayload) => {
	const secretKey = config.server.secretKey;
	const token = createToken(tokenPayload, secretKey, {
		expiresIn: "2h"
	});

	try {
		// remove existing resetPassword request
		await database
			.delete()
			.from("resetPassword")
			.where({
				email: tokenPayload.email
			});

		const insertPasswordResetToken = await database
			.insert({
				email: tokenPayload.email,
				token
			})
			.into("resetPassword")
			.returning("*");

		const urlObject = new URL(url);
		const passwordResetMailContent = await generateContent("reset", {
			url: urlObject.origin,
			domain: urlObject.host,
			resetLink: `${urlObject.origin}/password-reset/confirm/?token=${token}`
		});

		const noReplyEmail = `noreply@${urlObject.host}`;

		await mail.sendMail({
			from: noReplyEmail,
			to: tokenPayload.email,
			subject: "Reset your LogChimp password",
			text: passwordResetMailContent.text,
			html: passwordResetMailContent.html
		});

		return insertPasswordResetToken[0];
	} catch (err) {
		logger.error(err);
	}
};

module.exports = passwordReset;
