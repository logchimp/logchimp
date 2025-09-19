import database from "../../src/database";
import { createToken } from "../../src/services/token.service";
import { createUser } from "./seed/user";

export async function resetPassword() {
  const { user } = await createUser();

  const tokenPayload = { email: user.email, type: "resetPassword" };
  const token = createToken(tokenPayload, {
    expiresIn: "2h",
  });

  await database("resetPassword").insert({
    email: user.email,
    token,
    createdAt: new Date(),
  });

  return { user, token };
}
