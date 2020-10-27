// database
const database = require("../../database");

// services
const mail = require("../../services/mail");

// utils
const { createToken } = require("../../utils/token");
const logchimpConfig = require("../../utils/logchimpConfig");
const logger = require("../../utils/logger");
const config = logchimpConfig();

const passwordReset = async (siteUrl, tokenData) => {
	const secretKey = config.server.secretKey;
	const token = createToken(tokenData, secretKey, {
		expiresIn: "1h"
	});

	try {
		// remove existing resetPassword request
		await database
			.delete()
			.from("resetPassword")
			.where({
				emailAddress: tokenData.emailAddress
			});

		await database
			.insert({
				emailAddress: tokenData.emailAddress,
				token,
				createdAt: new Date().toJSON()
			})
			.into("resetPassword")
			.returning("*");

		const passwordResetMailContent = await mail.generateContent("reset", {
			siteUrl,
			resetLink: `${siteUrl}/forget/password/${token}`
		});

		const email = new mail.Mail();
		const noReplyEmail = `noreply@${siteUrl}`;

		await email.send({
			from: noReplyEmail,
			to: tokenData.emailAddress,
			subject: "Reset your LogChimp password",
			text: passwordResetMailContent.text,
			html: passwordResetMailContent.html
		});

		return true;
	} catch (err) {
		logger.error(err);
	}
};

module.exports = passwordReset;
