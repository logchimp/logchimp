import type { Knex } from "knex";
import type { IBoard } from "@logchimp/types";

export class BoardRepository {
  db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  async GetBoardByIDs(boardIds: string[]): Promise<IBoard[]> {
    if (boardIds.length === 0) return [];
    return this.db<IBoard>("boards")
      .select("boardId", "name", "url", "color", "createdAt")
      .whereIn("boardId", boardIds);
  }
}
