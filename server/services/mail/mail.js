// utils
const logchimpConfig = require("../../utils/logchimpConfig");
const config = logchimpConfig();
const logger = require("../../utils/logger");

if (config.mail) {
	const MailService = require(`@logchimp/${config.mail.service}`);
	const mail = new MailService(config.mail.apiKey, config.mail.domain);

	module.exports = mail;
} else {
	logger.warn("Email adapter missing");
}
