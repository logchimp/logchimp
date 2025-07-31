import bcrypt from "bcryptjs";

export function hashPassword(password: string): string {
  if (typeof password !== "string" || !password.trim()) {
    return null;
  }

  const bcryptSaltRounds = 10;
  const bcryptSalt = bcrypt.genSaltSync(bcryptSaltRounds);
  return bcrypt.hashSync(password, bcryptSalt);
}

export async function validatePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  if (
    typeof password !== "string" ||
    typeof hash !== "string" ||
    !password.trim() ||
    !hash.trim()
  ) {
    return false;
  }

  return await bcrypt.compare(password, hash);
}
