import * as jwt from "jsonwebtoken";

type LogChimpIdentityJwtPayload = {};

interface CreateLogChimpIdententityOptions {
  avatar?: string | null;
}

function createLogChimpIdentityJwt(
  userId: string,
  email: string,
  options: CreateLogChimpIdententityOptions,
) {
  const now = Math.floor(Date.now() / 1000);

  jwt.sign(
    {
      email,
      ...options,
    },
    "secret",
    {
      algorithm: "RS256",
      issuer: "saas",
      audience: "logchimp",
      subject: userId,
      issuedAt: now,
      expiresIn: "60s",
      jwtid: crypto.randomUUID(),
    },
  );
}
