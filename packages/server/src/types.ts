export interface IPasswordResetJwtPayload {
  userId: string;
  email: string;
  type: "resetPassword";
}

export interface IVerifyEmailJwtPayload {
  userId: string;
  email: string;
  type: "emailVerification";
}
