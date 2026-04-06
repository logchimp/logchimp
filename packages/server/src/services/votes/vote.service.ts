import { v4 as uuidv4 } from "uuid";
import type { IPublicUserInfo, IUserVoteV2 } from "@logchimp/types";
import type { Knex } from "knex";

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

interface GetVotesParams {
  postId: string;
  options: {
    first: number;
    after: string | null;
  };
}

export class VoteService {
  async getVotes({ postId, options }: GetVotesParams) {
    try {
      const votes = await this.getVotesQuery({ postId, options });
      const votesLength = votes.length;

      const startCursor = votesLength > 0 ? votes[0].voteId : null;
      const endCursor = votesLength > 0 ? votes[votesLength - 1].voteId : null;

      let totalCount: number | null = null;
      let totalPages: number | null = null;
      let currentPage: number | null = null;
      let hasNextPage: boolean | null = null;

      const votesMetadata = await this.getVotesMetadata({
        after: options.after,
      });

      if (votesMetadata) {
        totalCount = votesMetadata.totalVotesCount;
        totalPages = Math.ceil(totalCount / options.first);
        hasNextPage = votesMetadata.remainingVotesCount - options.first > 0;

        if (options.after) {
          const seenVotes = totalCount - votesMetadata.remainingVotesCount;
          currentPage = Math.floor(seenVotes / options.first) + 1;
        }
      }

      return {
        results: votes,
        page_info: {
          count: votesLength,
          current_page: currentPage,
          has_next_page: hasNextPage,
          start_cursor: startCursor,
          end_cursor: endCursor,
        },
        total_count: totalCount,
        total_pages: totalPages,
      };
    } catch (error) {
      logger.error({
        message: "Error getting votes",
        err: error,
      });

      throw error;
    }
  }

  async castVote(postId: string, userId: string) {
    try {
      const voteId = uuidv4();

      await database.transaction(async (trx) => {
        const vote = await this.getVote(trx, postId, userId);
        if (vote) {
          throw new ConflictError(
            "User has already voted on this post",
            ErrorCode.VOTE_EXISTS,
          );
        }

        await trx
          .insert({
            voteId,
            userId,
            postId,
          })
          .into("votes");
      });

      return voteId;
    } catch (error) {
      logger.error({
        message: "Error casting vote",
        err: error,
      });
      throw error;
    }
  }

  async retractVote(postId: string, userId: string) {
    try {
      const response = await database.delete().from("votes").where({
        postId,
        userId,
      });

      if (response === 0) {
        throw new NotFoundError(
          error.api.votes.voteNotFound,
          ErrorCode.VOTE_NOT_FOUND,
        );
      }
    } catch (error) {
      logger.error({
        message: "Error retracting vote",
        err: error,
      });
      throw error;
    }
  }

  async getUserVote(postId: string, userId: string): Promise<IUserVoteV2> {
    const query = await database("votes")
      .select<
        {
          voteId: string;
        } & IPublicUserInfo
      >(
        "votes.voteId",
        "users.userId",
        "users.name",
        "users.username",
        "users.avatar",
      )
      .innerJoin("users", "votes.userId", "users.userId")
      .where({
        "votes.postId": postId,
        "votes.userId": userId,
      })
      .limit(1);

    return {
      voteId: query.voteId,
      user: {
        userId: query.userId,
        name: query.name,
        username: query.username,
        avatar: query.avatar,
      },
    };
  }

  private getVote<T extends Knex | Knex.Transaction>(
    db: T,
    postId: string,
    userId: string,
  ) {
    return db
      .select<IVoteTableColumns>("voteId", "userId", "postId", "createdAt")
      .from("votes")
      .where({
        postId,
        userId,
      })
      .first();
  }

  private async getVotesQuery({
    postId,
    options,
  }: GetVotesParams): Promise<Array<IUserVoteV2>> {
    let query = database("votes")
      .select<
        Array<
          {
            voteId: string;
          } & IPublicUserInfo
        >
      >(
        "votes.voteId",
        "users.userId",
        "users.name",
        "users.username",
        "users.avatar",
      )
      .innerJoin("users", "votes.userId", "users.userId")
      .orderBy("votes.createdAt", "desc")
      .orderBy("votes.voteId", "desc")
      .where("votes.postId", "=", postId)
      .limit(options.first);

    if (options.after) {
      const afterVote = await this.getNextItemVote(options.after);

      query = this.applyCursorFilter(query, {
        after: afterVote.voteId,
        createdAt: afterVote.createdAt,
      });
    }

    const data = await query;
    return data.map((row) => ({
      voteId: row.voteId,
      user: {
        userId: row.userId,
        name: row.name,
        username: row.username,
        avatar: row.avatar,
      },
    }));
  }

  private applyCursorFilter(
    query: Knex.QueryBuilder,
    {
      after,
      createdAt,
    }: {
      after: string;
      createdAt: string;
    },
  ) {
    return query
      .where(function () {
        this.where("votes.createdAt", "<", createdAt).orWhere(function () {
          this.where("votes.createdAt", "=", createdAt).andWhere(
            "votes.voteId",
            "<=",
            after,
          );
        });
      })
      .offset(1);
  }

  /**
   * Get the next item using 'voteId' for the cursor pagination.
   *
   * @param voteId
   * @private
   */
  private getNextItemVote(voteId?: string) {
    return database("votes")
      .select<{
        voteId: string;
        createdAt: string;
      }>("voteId", "createdAt")
      .where({
        voteId,
      })
      .first();
  }

  private getVotesMetadata({ after }: { after?: string }) {
    return database.transaction(async (trx) => {
      const totalCountQuery = trx("votes")
        .count<{ count: string }>("* as count")
        .first();

      const totalVotesCount = Number.parseInt(
        String(totalCountQuery?.count ?? "0"),
        10,
      );

      let remainingVotesCount = totalVotesCount;
      if (after) {
        // const afte
        const afterVote = await this.getNextItemVote(after);

        if (afterVote) {
          const remainingVotesCountQuery = await trx
            .count<{ count: string }>("* as count")
            .from(
              this.applyCursorFilter(trx("votes"), {
                after: afterVote.voteId,
                createdAt: afterVote.createdAt,
              }).as("next"),
            )
            .first();

          remainingVotesCount = Number.parseInt(
            remainingVotesCountQuery?.count ?? "0",
            10,
          );
        }
      }

      return {
        totalVotesCount,
        remainingVotesCount,
      };
    });
  }
}
