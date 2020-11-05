// database
const database = require("../../database");

// services
const { mail, generateContent } = require("../../services/mail");

// utils
const { createToken } = require("../../utils/token");
const logchimpConfig = require("../../utils/logchimpConfig");
const logger = require("../../utils/logger");
const config = logchimpConfig();

const verifyEmail = async (domain, siteUrl, emailAddress) => {
	const secretKey = config.server.secretKey;
	const token = createToken({ emailAddress }, secretKey, {
		expiresIn: "2h"
	});

	try {
		await database
			.delete()
			.from("emailVerification")
			.where({
				emailAddress
			});

		const userEmailVerificationToken = await database
			.insert({
				emailAddress,
				token,
				createdAt: new Date().toJSON()
			})
			.into("emailVerification")
			.returning("*");

		const onboardingMailContent = await generateContent("verify", {
			siteUrl,
			verificationLink: `${domain}/email-verify/?token=${token}`
		});

		const noReplyEmail = `noreply@${siteUrl}`;

		await mail.send({
			from: noReplyEmail,
			to: emailAddress,
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
