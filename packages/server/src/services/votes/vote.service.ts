import { v4 as uuidv4 } from "uuid";

import database from "../../database";
import logger from "../../utils/logger";
import { ConflictError, ErrorCode, NotFoundError } from "../../utils/error";
import error from "../../errorResponse.json";

export interface IVoteTableColumns {
  voteId: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

export class VoteService {
  async castVote(postId: string, userId: string) {
    if (!userId || !postId) return;

    try {
      await database.transaction(async (trx) => {
        const vote = await this.getVote(postId, userId);
        if (vote) {
          throw new ConflictError(
            "User has already voted on this post",
            ErrorCode.VOTE_EXISTS,
          );
        }

        await trx
          .insert({
            voteId: uuidv4(),
            userId,
            postId,
          })
          .into("votes");
      });
    } catch (error) {
      logger.error({
        message: "Error casting vote",
        err: error,
      });
      throw error;
    }
  }

  async retractVote(postId: string, userId: string) {
    if (!userId || !postId) return;

    try {
      const vote = await this.getVote(postId, userId);
      if (!vote) {
        throw new NotFoundError(
          error.api.votes.voteNotFound,
          ErrorCode.VOTE_NOT_FOUND,
        );
      }

      await database.delete().from("votes").where({
        postId,
        userId,
      });
    } catch (error) {
      logger.error({
        message: "Error retracting vote",
        err: error,
      });
      throw error;
    }
  }

  private getVote(postId: string, userId: string) {
    return database
      .select<IVoteTableColumns>("voteId", "userId", "postId", "createdAt")
      .from("votes")
      .where({
        postId,
        userId,
      })
      .first();
  }
}
