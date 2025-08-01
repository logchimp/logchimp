export interface IAuthUser {
  userId: string;
  avatar: string;
  email: string;
  name: string;
  username: string;
  authToken: string;
}

export interface IAuthUserProfile {
  userId: string;
  name: string;
  username: string;
  email: string;
  isVerified: boolean;
}
