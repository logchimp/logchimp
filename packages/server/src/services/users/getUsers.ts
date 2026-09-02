import type { ApiSortType, IUserInfo } from "@logchimp/types";

// database
import database from "../../database";

// utils
import logger from "../../utils/logger";

interface GetUserQueryOptions {
  first: number;
  after?: string;
  created: ApiSortType;
  page?: number;
}

interface GetUserMetadataOptions {
  after?: string;
}

export async function getUsers({
  first,
  after,
  page,
  created,
}: GetUserQueryOptions): Promise<IUserInfo[]> {
  try {
    let users = database<IUserInfo>("users")
      .select(
        "userId",
        "name",
        "email",
        "username",
        "avatar",
        "isVerified",
        "isBlocked",
        "isOwner",
        "notes",
        "createdAt",
      )
      .orderBy("createdAt", created)
      .limit(first);

    if (page) {
      users = users.offset(first * (page - 1));
    } else if (after) {
      users = users
        .where(
          "createdAt",
          ">=",
          database("users").select("createdAt").where("userId", "=", after),
        )
        .offset(1);
    }

    return users;
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });

    return [];
  }
}

export async function getUserMetadata({ after }: GetUserMetadataOptions) {
  return database.transaction(async (trx) => {
    // Total count
    const totalCountQuery = trx("users");
    const totalCountResult = await totalCountQuery
      .count<{ count: string | number }[]>("* as count")
      .first();

    // Has next page
    let hasNextPageSubquery = trx("users").as("next");
    if (after) {
      hasNextPageSubquery = hasNextPageSubquery
        .where(
          "createdAt",
          ">=",
          trx("users").select("createdAt").where("userId", "=", after),
        )
        .offset(1);
    }

    const hasNextPageResult = await trx
      .count<{ count: string | number }[]>({ count: "*" })
      .from(hasNextPageSubquery)
      .first();

    const totalCount = Number.parseInt(String(totalCountResult.count), 10);

    const remainingResultsCount = Number.parseInt(
      String(hasNextPageResult.count),
      10,
    );

    return {
      totalCount,
      remainingResultsCount,
    };
  });
}
