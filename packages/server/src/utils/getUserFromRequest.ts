import type { Request } from "express";
import jwt from "jsonwebtoken";
import logchimpConfig from "./logchimpConfig";
const config = logchimpConfig();

export function getUserFromRequest(req: Request) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    const secretKey =
      process.env.LOGCHIMP_SECRET_KEY || config.server.secretKey;

    const decoded = jwt.verify(token, secretKey);

    return decoded;
    // biome-ignore lint/correctness/noUnusedVariables: error intentionally ignored
  } catch (err) {
    return null;
  }
}
