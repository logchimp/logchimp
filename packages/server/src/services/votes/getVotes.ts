import type { components } from "@logchimp/api-ts-types";

import database from "../../database";
import logger from "../../utils/logger";
import type { IVoteTableColumns } from "../../repository/vote";

export async function getVotes(postId: string, userId?: string) {
  try {
    const votesCount = await database
      .count<{ count: string }>("voteId")
      .from("votes")
      .where({
        postId,
      })
      .first();

    const votes = await database
      .select<Array<components["schemas"]["UserVote"]>>(
        "votes.*",
        "users.name",
        "users.username",
        "users.avatar",
      )
      .from("votes")
      .innerJoin("users", "votes.userId", "users.userId")
      .where({
        postId,
      })
      .limit(6);

    let viewerVote: components["schemas"]["CurrentUserVote"] | undefined;
    if (userId) {
      viewerVote = (await database
        .select<IVoteTableColumns>()
        .from("votes")
        .where({
          postId,
          userId,
        })
        .first()) satisfies components["schemas"]["CurrentUserVote"];
    }

    return {
      votes,
      votesCount: votesCount?.count ? Number.parseInt(votesCount.count, 10) : 0,
      viewerVote,
    };
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });
  }
}
