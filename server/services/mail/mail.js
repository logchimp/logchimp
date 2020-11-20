const nodemailer = require("nodemailer");

// utils
const logchimpConfig = require("../../utils/logchimpConfig");
const config = logchimpConfig();
const logger = require("../../utils/logger");

if (config.mail) {
	const mail = nodemailer.createTransport({
		host: config.mail.host,
		port: config.mail.port,
		secure: false,
		auth: {
			user: config.mail.user,
			pass: config.mail.password
		}
	});

	module.exports = mail;
} else {
	logger.warn("Email adapter missing");
}
