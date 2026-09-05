import type { Knex } from "knex";
import type Valstash from "iovalkey";
import logger from "../utils/logger";

type GetManyWithCachedOptions = {
  ids: string[];
  keyPrefix: string;
};

type GetManyWithCachedResult<T> = {
  results: T[];
  missingIds: string[];
};

type CacheMissingResultsOptions<T> = {
  idField: keyof T;
  keyPrefix: string;
  ttlSeconds: number;
  results: T[];
};

export class QueryRepository {
  db: Knex;
  cache?: Valstash;

  constructor(db: Knex, cache?: Valstash) {
    this.db = db;
    this.cache = cache;
  }

  protected async GetManyWithCached<T>(
    options: GetManyWithCachedOptions,
  ): Promise<GetManyWithCachedResult<T>> {
    const results: T[] = [];
    if (!this.cache) {
      return { results, missingIds: options.ids };
    }

    const { ids, keyPrefix } = options;

    const missingIds: string[] = [];
    if (ids.length === 0) return { results, missingIds };

    const keys = ids.map((id) => `${keyPrefix}:${id}`);

    try {
      const cached = await this.cache.mget(keys);

      cached.forEach((raw, index) => {
        if (raw) {
          results.push(JSON.parse(raw) as T);
        } else {
          missingIds.push(ids[index]);
        }
      });
    } catch (err) {
      logger.error({
        message: "Error fetching cached results",
        err,
      });

      missingIds.push(...ids);
    }

    return { results, missingIds };
  }

  protected async CacheMissingResults<T>(
    options: CacheMissingResultsOptions<T>,
  ) {
    const { results, idField, keyPrefix, ttlSeconds } = options;

    if (results.length === 0 || !this.cache) return;

    const pipeline = this.cache.pipeline();

    for (const item of results) {
      const key = `${keyPrefix}:${item[idField]}`;
      pipeline.set(key, JSON.stringify(item), "EX", ttlSeconds);
    }

    try {
      await pipeline.exec();
    } catch (err) {
      logger.error({
        message: "Error caching missing results",
        err,
      });
    }
  }
}
