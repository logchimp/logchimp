// services
const mail = require("../../services/mail");

// utils
const { createToken } = require("../../utils/token");
const logchimpConfig = require("../../utils/logchimpConfig");
const config = logchimpConfig();

const verifyEmail = async (siteUrl, emailAddress) => {
	const secretKey = config.server.secretKey;
	const authToken = createToken({ emailAddress }, secretKey, {
		expiresIn: "2h"
	});

	const onboardingMailContent = await mail.generateContent("verify", {
		siteUrl,
		verificationLink: `${siteUrl}/verify/email/${authToken}`
	});

	const email = new mail.Mail();
	const noReplyEmail = `noreply@${siteUrl}`;

	await email.send({
		from: noReplyEmail,
		to: emailAddress,
		subject: "LogChimp - Please confirm your email",
		text: onboardingMailContent.text,
		html: onboardingMailContent.html
	});

	return authToken;
};

module.exports = verifyEmail;
