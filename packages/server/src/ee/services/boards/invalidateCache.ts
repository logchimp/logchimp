import database from "../../../database";
import { valkey } from "../../../cache";
import { BoardRepository } from "../../repository/board";

const boardRepository = new BoardRepository(database, valkey);

/**
 * Invalidates cached board data after a post write changes a board's
 * `post_count`.
 *
 * `board:private:<boardId>` caches `post_count` for seven days, so a post
 * creation, deletion, or move leaves a stale count behind unless the affected
 * boards are invalidated.
 *
 * Board IDs are accepted as nullable so callers can pass a post's `boardId`
 * (which is null for posts without a board) without a null check.
 */
export async function invalidateBoardCache(
  boardIds: Array<string | null | undefined>,
): Promise<void> {
  const ids = boardIds.filter((boardId): boardId is string => Boolean(boardId));

  if (ids.length === 0) return;

  await boardRepository.InvalidateBoardCache(ids, ["private", "detail"]);
}
