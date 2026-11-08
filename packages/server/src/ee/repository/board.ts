import type { components } from "@logchimp/api-ts-types";

import { QueryRepository } from "../../repository/query";
import { DAY } from "../../cache/time";
import logger from "../../utils/logger";

type BoardCacheKey = "public" | "detail" | "private";

export class BoardRepository extends QueryRepository {
  async GetPublicBoardByIDs(
    boardIds: string[],
  ): Promise<components["schemas"]["BoardItem"][]> {
    const keyPrefix = "board:public";

    if (boardIds.length === 0) return [];

    const { results, missingIds } = await this.GetManyWithCached<
      components["schemas"]["BoardItem"]
    >({
      ids: boardIds,
      keyPrefix,
    });

    if (missingIds.length === 0) return results;

    const dbResults = await this.db("boards")
      .select<components["schemas"]["BoardItem"][]>(
        "boardId",
        "name",
        "url",
        "color",
        "createdAt",
      )
      .whereIn("boardId", missingIds);

    await this.CacheMissingResults<components["schemas"]["BoardItem"]>({
      idField: "boardId",
      results: dbResults,
      keyPrefix,
      ttlSeconds: DAY * 7,
    });

    return [...results, ...dbResults];
  }

  async GetPrivateBoardByIDs(
    boards: string[],
  ): Promise<components["schemas"]["BoardPrivate"][]> {
    const keyPrefix = "board:private";

    if (boards.length === 0) return [];

    const { results, missingIds } = await this.GetManyWithCached<
      components["schemas"]["BoardPrivate"]
    >({
      ids: boards,
      keyPrefix,
    });

    if (missingIds.length === 0) return results;

    const dbResults = await this.db("boards")
      .select<components["schemas"]["BoardPrivate"][]>(
        "boards.boardId",
        "boards.name",
        "boards.url",
        "boards.color",
        "boards.display",
        "boards.view_voters",
        "boards.createdAt",
      )
      .count<components["schemas"]["BoardPrivate"][]>("posts.postId", {
        as: "post_count",
      })
      .from("boards")
      .leftJoin("posts", "boards.boardId", "posts.boardId")
      .groupBy("boards.boardId")
      .whereIn("boards.boardId", missingIds);

    const typedDbResults = dbResults.map((board) => ({
      ...board,
      // convert post_count from string → number
      post_count: Number(board.post_count),
    })) as components["schemas"]["BoardPrivate"][];

    await this.CacheMissingResults<components["schemas"]["BoardPrivate"]>({
      idField: "boardId",
      results: typedDbResults,
      keyPrefix,
      ttlSeconds: DAY * 7,
    });

    return [...results, ...typedDbResults];
  }

  async InvalidateBoardCache(
    boardIds: string[],
    keys: BoardCacheKey[] = ["public", "detail", "private"],
  ): Promise<void> {
    if (!this.cache || boardIds.length === 0) return;

    const cacheKeys = boardIds.flatMap((boardId) =>
      keys.map((key) => `board:${key}:${boardId}`),
    );

    try {
      await this.cache.del(cacheKeys);
    } catch (err) {
      logger.log({ level: "error", message: err });
    }
  }
}
