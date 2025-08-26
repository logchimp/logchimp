import type { Request, Response, NextFunction } from "express";
// services
import { mail } from "../services/mail";

export async function mailConfigExists(
  _: Request,
  res: Response,
  next: NextFunction,
) {
  if (!mail) {
    return res.status(501).send({
      message: "Mail configuration missing",
      code: "MAIL_CONFIG_MISSING",
    });
  }

  next();
}
