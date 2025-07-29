// services
import { mail } from "../services/mail";

export async function mailConfigExists(_, res, next) {
  if (!mail) {
    return res.status(501).send({
      message: "Mail configuration missing",
      code: "MAIL_CONFIG_MISSING",
    });
  }

  next();
}
