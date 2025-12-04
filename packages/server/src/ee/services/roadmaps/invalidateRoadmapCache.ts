import * as cache from "../../../cache";
import logger from "../../../utils/logger";
import { deleteKeysByPattern } from "../../../helpers";

export async function invalidateRoadmapCache(options?: {
  name?: string;
  url?: string;
  oldName?: string;
  oldUrl?: string;
  all?: boolean;
}): Promise<void> {
  if (!cache.isActive) return;

  try {
    // If full invalidation requested (sort, delete, etc.)
    if (options?.all) {
      await deleteKeysByPattern("roadmaps:search:*");
      await deleteKeysByPattern("roadmaps:url:*");
      return;
    }
    // Otherwise, invalidate by specific name/url combinations
    const keys: string[] = [];

    if (options?.oldName) keys.push(`roadmaps:search:${options.oldName}`);
    if (options?.oldUrl) keys.push(`roadmaps:url:${options.oldUrl}`);
    if (options?.name && options.name !== options.oldName)
      keys.push(`roadmaps:search:${options.name}`);
    if (options?.url && options.url !== options.oldUrl)
      keys.push(`roadmaps:url:${options.url}`);

    if (keys.length > 0) {
      await cache.valkey.del(keys);
    }
  } catch (err) {
    logger.error({
      message: "Failed to invalidate roadmap cache",
      error: err,
    });
  }
}
