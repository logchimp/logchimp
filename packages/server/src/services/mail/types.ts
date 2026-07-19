import type { BaseEmailData } from "./generateContent";

export interface EmailAccountVerification extends BaseEmailData {
  verificationLink: string;
}

export interface EmailPasswordReset extends BaseEmailData {
  resetLink: string;
}

export interface PostRoadmapChangeNotification extends BaseEmailData {
  readonly postTitle: string;
  readonly postDescription: string;
  readonly roadmapTitle: string;
  readonly roadmapColor: string;
}
