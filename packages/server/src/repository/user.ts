import type { Knex } from "knex";
import type { IPublicUserInfo, IUserInfo } from "@logchimp/types";
import type { TCreatedUser } from "../services/auth/types";
import database from "../database";

export class UserRepository {
  db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  async GetUserPublicInfo(userIds: string[]) {
    if (userIds.length === 0) return [];
    return this.db
      .select<IPublicUserInfo[]>("userId", "name", "avatar", "username")
      .from("users")
      .whereIn("userId", userIds);
  }
}

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
  const e = (email || "").trim();

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
    .where(database.raw("LOWER(email) = LOWER(?)", [e]))
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
