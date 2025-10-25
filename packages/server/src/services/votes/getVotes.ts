import database from "../../database";

// utils
import logger from "../../utils/logger";

export async function getVotes(postId: string, userId?: string) {
  try {
    const votesCount = (await database
      .count("voteId")
      .from("votes")
      .where({
        postId,
      })
      .first()) as { count: string };

    const votes = await database
      .select("votes.*", "users.name", "users.username", "users.avatar")
      .from("votes")
      .innerJoin("users", "votes.userId", "users.userId")
      .where({
        postId,
      })
      .limit(6);

    const viewerVote = await database
      .select()
      .from("votes")
      .where({
        postId,
        userId: userId || null,
      })
      .first();

    return {
      votes,
      votesCount: Number.parseInt(votesCount.count, 10),
      viewerVote: viewerVote,
    };
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });
  }
}
