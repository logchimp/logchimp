export interface IUser {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  username?: string;
  isVerified: boolean;
  // vote count
  votes: string;
  // post count
  posts: string;
  roles: IUserRole[];
}

export interface IGetAllUsers {
  users: IUser[];
}

export interface IUserRole {
  id: string;
  name: string;
  user_role_id: string;
}
