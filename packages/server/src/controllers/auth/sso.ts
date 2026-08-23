import type { Request, Response } from "express";

export function logchimpIdentityCallback(req: Request, res: Response) {
  // ?redirect_uri=
  const redirectUri = req.query.redirect_uri.toString();

  // ?token=
  const token = (req.query.token.toString() || "").trim();
  if (!token) {
    res.redirect(`${redirectUri}?code=INVALID_TOKEN`);
  }

  //   verify signature
  //         ↓
  // find/create LogChimp user
  //         ↓
  // Set-Cookie: logchimp_session=...
  // ↓
  // LogChimp
}
