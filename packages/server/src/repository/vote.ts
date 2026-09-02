import type { Knex } from "knex";
import logger from "../utils/logger";
import type { IPostVote } from "@logchimp/types";

export interface IVoteTableColumns {
  voteId: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface IUserVoter extends IVoteTableColumns {
  name: string;
  username: string;
  avatar: string;
}

export class VoteRepository {
  db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  async GetVotesByPostIDs(
    postIds: string[],
    userId?: string,
  ): Promise<Map<string, IPostVote>> {
    const votesMap = new Map<string, IPostVote>();

    if (postIds.length === 0) {
      return votesMap;
    }

    for (const postId of postIds) {
      votesMap.set(postId, { votes: [], votesCount: 0, viewerVote: undefined });
    }

    try {
      const [counts, rankedVotes, viewerVotes] = await Promise.all([
        this.getCounts(postIds),
        this.getRankedVotes(postIds, 6),
        userId ? this.getViewerVotes(postIds, userId) : Promise.resolve([]),
      ]);

      for (const c of counts) {
        const entry = votesMap.get(c.postId);
        if (entry) {
          entry.votesCount = Number.parseInt(c.count, 10);
        }
      }

      for (const v of rankedVotes) {
        votesMap.get(v.postId)?.votes.push(v);
      }

      for (const vv of viewerVotes) {
        const entry = votesMap.get(vv.postId);
        if (entry) {
          entry.viewerVote = vv;
        }
      }

      return votesMap;
    } catch (err) {
      logger.log({
        level: "error",
        message: err,
      });
      return votesMap;
    }
  }

  private async getCounts(
    postIds: string[],
  ): Promise<Array<{ postId: string; count: string }>> {
    return this.db
      .select("postId")
      .count("voteId as count")
      .from("votes")
      .whereIn("postId", postIds)
      .groupBy("postId");
  }

  private async getRankedVotes(
    postIds: string[],
    limitPerPost: number,
  ): Promise<IUserVoter[]> {
    const rankedSubquery = this.db
      .select(
        "votes.*",
        "users.name",
        "users.username",
        "users.avatar",
        this.db.raw(
          'ROW_NUMBER() OVER (PARTITION BY "votes"."postId" ORDER BY "votes"."voteId") as rn',
        ),
      )
      .from("votes")
      .innerJoin("users", "votes.userId", "users.userId")
      .whereIn("votes.postId", postIds);

    console.log("ranked query:");
    console.log(rankedSubquery.toQuery());

    return this.db
      .select<Array<IUserVoter & { rn: number }>>("*")
      .from(rankedSubquery.as("ranked"))
      .where("rn", "<=", limitPerPost);
  }

  private async getViewerVotes(
    postIds: string[],
    userId: string,
  ): Promise<IVoteTableColumns[]> {
    return this.db
      .select<IVoteTableColumns[]>("*")
      .from("votes")
      .whereIn("postId", postIds)
      .andWhere({ userId });
  }
}
