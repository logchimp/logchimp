import type { components } from "@logchimp/api-ts-types";

// database
import database from "../../database";

// utils
import logger from "../../utils/logger";

interface GetUserQueryOptions {
  first: number;
  after?: string;
  created: components["schemas"]["SortTypeEnum"];
  page?: number;
}

interface GetUserMetadataOptions {
  after?: string;
  created: ApiSortType;
}

export async function getUsers({
  first,
  after,
  page,
  created,
}: GetUserQueryOptions): Promise<components["schemas"]["CustomerItemInfo"][]> {
  try {
    let users = database<components["schemas"]["CustomerItemInfo"]>("users")
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
      .orderBy("userId", created)
      .limit(first);

    if (page) {
      users = users.offset(first * (page - 1));
    } else if (after) {
      const afterUser = await database("users")
        .select("createdAt", "userId")
        .where("userId", "=", after)
        .first();

      if (afterUser) {
        users = users
          .where((builder) => {
            if (created === "DESC") {
              builder
                .where("createdAt", "<", afterUser.createdAt)
                .orWhere((build) => {
                  build
                    .where("createdAt", "=", afterUser.createdAt)
                    .andWhere("userId", "<", afterUser.userId);
                });
            } else {
              builder
                .where("createdAt", ">", afterUser.createdAt)
                .orWhere((build) => {
                  build
                    .where("createdAt", "=", afterUser.createdAt)
                    .andWhere("userId", ">", afterUser.userId);
                });
            }
          })
          .offset(1);
      }
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

export async function getUserMetadata({
  after,
  created,
}: GetUserMetadataOptions) {
  return database.transaction(async (trx) => {
    // Total count
    const totalCountQuery = trx("users");
    const totalCountResult = await totalCountQuery
      .count<{ count: string }>("* as count")
      .first();

    // Has next page
    let hasNextPageSubquery = trx("users").as("next");
    if (after) {
      const afterUser = await trx("users")
        .select("createdAt", "userId")
        .where("userId", "=", after)
        .first();

      if (afterUser) {
        hasNextPageSubquery = hasNextPageSubquery
          .where((builder) => {
            if (created === "DESC") {
              builder
                .where("createdAt", "<", afterUser.createdAt)
                .orWhere((build) => {
                  build
                    .where("createdAt", "=", afterUser.createdAt)
                    .andWhere("userId", "<", afterUser.userId);
                });
            } else {
              builder
                .where("createdAt", ">", afterUser.createdAt)
                .orWhere((build) => {
                  build
                    .where("createdAt", "=", afterUser.createdAt)
                    .andWhere("userId", ">", afterUser.userId);
                });
            }
          })
          .offset(1)
          .orderBy("createdAt", created)
          .orderBy("userId", created);
      }
    }

    const hasNextPageResult = await trx
      .count<{ count: string }>("* as count")
      .from(hasNextPageSubquery)
      .first();

    const totalCount = Number.parseInt(totalCountResult.count, 10);

    const remainingResultsCount = Number.parseInt(hasNextPageResult.count, 10);

    return {
      totalCount,
      remainingResultsCount,
    };
  });
}
