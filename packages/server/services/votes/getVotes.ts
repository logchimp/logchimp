import database from "../../database";

// utils
import logger from "../../utils/logger";

export async function getVotes(postId, userId) {
  try {
    const votesCount = await database
      .count("voteId")
      .from("votes")
      .where({
        postId,
      })
      .first();

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
      votesCount: parseInt(votesCount.count),
      viewerVote: viewerVote,
    };
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });
  }
}
