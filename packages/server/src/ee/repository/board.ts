import type { IBoard, IBoardPrivate } from "@logchimp/types";
import { QueryRepository } from "../../repository/query";
import { DAY } from "../../cache/time";

export class BoardRepository extends QueryRepository {
  async GetPublicBoardByIDs(boardIds: string[]): Promise<IBoard[]> {
    const keyPrefix = "board:public";

    if (boardIds.length === 0) return [];

    const { results, missingIds } = await this.GetManyWithCached<IBoard>({
      ids: boardIds,
      keyPrefix,
    });

    const dbResults = await this.db("boards")
      .select<IBoard[]>("boardId", "name", "url", "color", "createdAt")
      .whereIn("boardId", missingIds);

    await this.CacheMissingResults<IBoard>({
      idField: "boardId",
      results: dbResults,
      keyPrefix,
      ttlSeconds: DAY * 7,
    });

    return [...results, ...dbResults];
  }

  async GetPrivateBoardByIDs(boards: string[]): Promise<IBoardPrivate[]> {
    const keyPrefix = "board:private";

    if (boards.length === 0) return [];

    const { results, missingIds } = await this.GetManyWithCached<IBoardPrivate>(
      {
        ids: boards,
        keyPrefix,
      },
    );

    const dbResults = await this.db("boards")
      .select<IBoardPrivate[]>(
        "boards.boardId",
        "boards.name",
        "boards.url",
        "boards.color",
        "boards.display",
        "boards.view_voters",
        "boards.createdAt",
        "COUNT(posts.postId) as post_count",
      )
      .from("boards")
      .leftJoin("posts", "boards.boardId", "posts.boardId")
      .groupBy("boards.boardId")
      .whereIn("boards.boardId", missingIds);

    await this.CacheMissingResults<IBoardPrivate>({
      idField: "boardId",
      results: dbResults,
      keyPrefix,
      ttlSeconds: DAY * 7,
    });

    return [...results, ...dbResults];
  }
}
