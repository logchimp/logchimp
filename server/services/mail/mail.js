const logchimpConfig = require("../../utils/logchimpConfig");
const config = logchimpConfig();

const MailService = require(`@logchimp/${config.mail.service}`);
const mail = new MailService(config.mail.apiKey, config.mail.domain);

module.exports = mail;
