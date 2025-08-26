import jwt from "jsonwebtoken";
import logchimpConfig from "./logchimpConfig";
import logger from "./logger";
const config = logchimpConfig();

export function getUserFromRequest(authHeader?: string) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    const secretKey =
      process.env.LOGCHIMP_SECRET_KEY || config.server.secretKey;

    const decoded = jwt.verify(token, secretKey);

    return decoded;
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });
    return null;
  }
}
