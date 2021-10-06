const path = require("path");
const fs = require("fs-extra");

const config = () => {
	try {

		const logchimpConfigUri = process.env.LOGCHIMP_CONFIG || path.resolve(__dirname, "../../logchimp.config.json");

		const fileConfig = fs.existsSync(logchimpConfigUri) ? fs.readJsonSync(logchimpConfigUri) : {};

		const cfg = new Proxy({}, {
			get: (_, grp) => {
				return new Proxy({}, {
					get: (_, attr) => {
						// Convert camel case to snake case
						const envName = `${grp}__${attr}`.replace(/[A-Z]/g, l => `_${l}`).toUpperCase();

						if (process.env[`LOGCHIMP__${envName}`])
							return process.env[`LOGCHIMP__${envName}`];

						return fileConfig[grp][attr];

					}
				});
			}
		});

		return cfg;

	} catch (error) {
		return false;
	}
};

module.exports = config;
