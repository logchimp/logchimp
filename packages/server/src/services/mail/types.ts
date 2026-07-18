import type { BaseEmailData } from "./generateContent";

export interface EmailAccountVerification extends BaseEmailData {
  verificationLink: string;
}

export interface EmailPasswordReset extends BaseEmailData {
  resetLink: string;
}
