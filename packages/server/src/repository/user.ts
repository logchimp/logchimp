import type { Knex } from "knex";
import type { components } from "@logchimp/api-ts-types";

import type { TCreatedUser } from "../services/auth/types";
import database from "../database";
import { QueryRepository } from "./query";
import { DAY } from "../cache/time";

export class UserRepository extends QueryRepository {
  async GetUserPublicInfo(userIds: string[]) {
    const keyPrefix = "user:public";

    if (userIds.length === 0) return [];

    const { results, missingIds } = await this.GetManyWithCached<
      components["schemas"]["PublicUserInfo"]
    >({
      keyPrefix,
      ids: userIds,
    });

    const dbResults = await this.db
      .select<components["schemas"]["PublicUserInfo"][]>(
        "userId",
        "name",
        "avatar",
        "username",
      )
      .from("users")
      .whereIn("userId", missingIds);

    await this.CacheMissingResults<components["schemas"]["PublicUserInfo"]>({
      idField: "userId",
      keyPrefix,
      results: dbResults,
      ttlSeconds: DAY * 3,
    });

    return [...results, ...dbResults];
  }
}

export function getUserById(db: Knex, id: string) {
  return db("users")
    .select<components["schemas"]["CustomerItemInfo"]>(
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
    .select<components["schemas"]["CustomerItemInfo"]>(
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
