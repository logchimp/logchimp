import type { Knex } from "knex";
import type { IUserInfo } from "@logchimp/types";

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
