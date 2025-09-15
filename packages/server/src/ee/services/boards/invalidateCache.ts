import * as cache from "../../../cache";
import logger from "../../../utils/logger";

export async function invalidateBoardCache(boardId: string): Promise<void> {
  if (!cache.isActive) return;

  const keys = [
    `board:public:${boardId}`,
    `board:detail:${boardId}`,
    `board:private:${boardId}`,
  ];

  try {
    await cache.valkey.del(keys);
  } catch (err) {
    logger.log({ level: "error", message: err });
  }
}
