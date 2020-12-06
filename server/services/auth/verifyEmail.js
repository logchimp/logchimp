// database
const database = require("../../database");

// services
const { mail, generateContent } = require("../../services/mail");

// utils
const { createToken } = require("../../utils/token");
const logchimpConfig = require("../../utils/logchimpConfig");
const logger = require("../../utils/logger");
const config = logchimpConfig();

const verifyEmail = async (domain, siteUrl, email) => {
	const secretKey = config.server.secretKey;
	const token = createToken({ email }, secretKey, {
		expiresIn: "2h"
	});

	try {
		await database
			.delete()
			.from("emailVerification")
			.where({
				email
			});

		const userEmailVerificationToken = await database
			.insert({
				email,
				token
			})
			.into("emailVerification")
			.returning("*");

		const onboardingMailContent = await generateContent("verify", {
			siteUrl,
			verificationLink: `${domain}/email-verify/?token=${token}`
		});

		const noReplyEmail = `noreply@${siteUrl}`;

		await mail.sendMail({
			from: noReplyEmail,
			to: email,
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
