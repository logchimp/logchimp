// modules
const path = require("path");
const { createLogger, format, transports } = require("winston");

const oneLineForamt = format.printf(({ level, code, message, timestamp }) => {
	return `${timestamp} ${level.toUpperCase()}: ${
		code ? `[${code}]` : ""
	} ${message}`;
});

const logger = createLogger({
	format: format.combine(
		format.timestamp({
			format: "YYYY-MM-DD HH:mm:ss Z"
		}),
		oneLineForamt
	),
	transports: [
		new transports.File({
			filename: path.resolve(
				__dirname,
				"../../content/logs/logchimp-error.log"
			),
			level: "error"
		}),
		new transports.File({
			filename: path.resolve(__dirname, "../../content/logs/logchimp-all.log")
		})
	]
});

module.exports = logger;
