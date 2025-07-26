import type { Response, NextFunction } from "express";

// services
import { mail as mailConfig } from "../services/mail/index.mjs";

async function mailConfigExists(_: unknown, res: Response, next: NextFunction) {
  if (!mailConfig) {
    return res.status(501).send({
      message: "Mail configuration missing",
      code: "MAIL_CONFIG_MISSING",
    });
  }

  next();
}

export default mailConfigExists;
