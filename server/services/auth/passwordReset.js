// database
const database = require("../../database");

// services
const { mail, generateContent } = require("../../services/mail");

// utils
const { createToken } = require("../../utils/token");
const logchimpConfig = require("../../utils/logchimpConfig");
const logger = require("../../utils/logger");
const config = logchimpConfig();

const passwordReset = async (url, tokenData) => {
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
				email: tokenData.email
			});

		await database
			.insert({
				email: tokenData.email,
				token
			})
			.into("resetPassword")
			.returning("*");

		const domain = new URL(url).host;
		const passwordResetMailContent = await generateContent("reset", {
			url,
			domain,
			resetLink: `${domain}/password-reset/confirm/?token=${token}`
		});

		const noReplyEmail = `noreply@${domain}`;

		await mail.sendMail({
			from: noReplyEmail,
			to: tokenData.email,
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
