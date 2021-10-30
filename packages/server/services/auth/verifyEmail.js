// database
const database = require("../../database");

// services
const { mail, generateContent } = require("../../services/mail");

// utils
const { createToken } = require("../../utils/token");
const logchimpConfig = require("../../utils/logchimpConfig");
const logger = require("../../utils/logger");
const config = logchimpConfig();

const verifyEmail = async (url, tokenPayload) => {
	const secretKey = config.server.secretKey;
	const token = createToken(tokenPayload, secretKey, {
		expiresIn: "2h"
	});

	try {
		await database
			.delete()
			.from("emailVerification")
			.where({
				email: tokenPayload.email
			});

		const userEmailVerificationToken = await database
			.insert({
				email: tokenPayload.email,
				token
			})
			.into("emailVerification")
			.returning("*");

		const urlObject = new URL(url);
		const onboardingMailContent = await generateContent("verify", {
			url: urlObject.origin,
			domain: urlObject.host,
			verificationLink: `${urlObject.origin}/verify/?token=${token}`
		});

		const noReplyEmail = `noreply@${urlObject.host}`;

		await mail.sendMail({
			from: noReplyEmail,
			to: tokenPayload.email,
			subject: "LogChimp - Please confirm your email",
			text: onboardingMailContent.text,
			html: onboardingMailContent.html
		});

		return userEmailVerificationToken[0];
	} catch (err) {
		logger.error(err.message);
	}
};

module.exports = verifyEmail;
