import type { BaseEmailData } from "./generateContent";

export interface EmailAccountVerification extends BaseEmailData {
  verificationLink: string;
}

export interface EmailPasswordReset extends BaseEmailData {
  resetLink: string;
}

export interface ISendPostRoadmapChangeMailPayload {
  readonly displayName: string;
  readonly recipientEmail: string;
  readonly postUrl: string;
  readonly postTitle: string;
  readonly postDescription: string;
  readonly roadmapTitle: string;
  readonly roadmapColor: string;
}
