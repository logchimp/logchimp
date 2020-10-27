const nodemailer = require("nodemailer");

class Mail {
	constructor() {
		const transport = nodemailer.createTransport({
			sendmail: true
		});

		this.transport = transport;
	}

	async send(message) {
		try {
			const mail = await this.transport.sendMail(message);
			return mail;
		} catch (error) {
			console.error(error);
		}
	}
}

module.exports = Mail;
