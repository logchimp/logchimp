import type { IBoard } from "@logchimp/types";
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
}
