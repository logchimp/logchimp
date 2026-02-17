// modules
import path from "path";
import { createLogger, format, transports } from "winston";

const oneLineFormat = format.printf(({ level, code, message, timestamp }) => {
  return `${timestamp} ${level.toUpperCase()}: ${code ? `[${code}] ` : ""}${message}`;
});

const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss Z",
    }),
    oneLineFormat,
  ),
  transports: [
    // in beta
    new transports.Console({
      format: format.simple(),
    }),
    new transports.File({
      filename: path.resolve(
        __dirname,
        "../../../../content/logs/logchimp-error.log",
      ),
      level: "error",
    }),
    new transports.File({
      filename: path.resolve(
        __dirname,
        "../../../../content/logs/logchimp-all.log",
      ),
    }),
  ],
});

export default logger;
