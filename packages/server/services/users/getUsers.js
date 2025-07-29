// database
import database from "../../database";

// utils
import logger from "../../utils/logger";

export async function getUsers(created, limit, page) {
  try {
    const users = await database
      .select("userId", "name", "email", "username", "avatar", "isVerified")
      .from("users")
      .limit(limit)
      .offset(limit * page)
      .orderBy([
        {
          column: "createdAt",
          order: created,
        },
      ]);

    return users;
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });
  }
}
