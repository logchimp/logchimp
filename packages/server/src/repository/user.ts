import type { Knex } from "knex";
import type { IUserInfo } from "@logchimp/types";
import type { TCreatedUser } from "../services/auth/types";

export function getUserById(db: Knex, id: string) {
  return db("users")
    .select<IUserInfo>(
      "userId",
      "name",
      "username",
      "avatar",
      "email",
      "isVerified",
      "isBlocked",
      "isOwner",
      "notes",
      "createdAt",
    )
    .where("userId", id)
    .first();
}

export function getUserByEmail(db: Knex, email: string) {
  return db("users")
    .select<IUserInfo>(
      "userId",
      "name",
      "username",
      "avatar",
      "email",
      "isVerified",
      "isBlocked",
      "isOwner",
      "notes",
      "createdAt",
    )
    .where("email", email)
    .first();
}

export interface IInsertUserQuery {
  userId: string;
  name: string;
  username: string;
  email: string;
  hashedPassword: string;
  avatar: string;
}

export function insertUser(
  db: Knex,
  { name, email, hashedPassword, avatar, username, userId }: IInsertUserQuery,
) {
  return db
    .insert({
      userId,
      name,
      username,
      email,
      password: hashedPassword,
      avatar,
    })
    .into("users")
    .returning<Array<TCreatedUser>>([
      "userId",
      "name",
      "username",
      "email",
      "avatar",
    ]);
}
