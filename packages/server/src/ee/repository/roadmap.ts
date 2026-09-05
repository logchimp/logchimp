import type { IRoadmap, IRoadmapPrivate } from "@logchimp/types";
import { QueryRepository } from "../../repository/query";
import { DAY } from "../../cache/time";

export class RoadmapRepository extends QueryRepository {
  async GetPublicRoadmapByIDs(roadmapIds: string[]): Promise<IRoadmap[]> {
    const keyPrefix = "roadmap:public";

    if (roadmapIds.length === 0) return [];

    const { results, missingIds } = await this.GetManyWithCached<IRoadmap>({
      ids: roadmapIds,
      keyPrefix,
    });

    const dbResults = await this.db("roadmaps")
      .select<IRoadmap[]>("id", "name", "url", "color")
      .whereIn("id", missingIds);

    await this.CacheMissingResults<IRoadmap>({
      idField: "id",
      keyPrefix,
      results: dbResults,
      ttlSeconds: DAY * 7,
    });

    return [...results, ...dbResults];
  }

  GetById(id: string) {
    return this.db<IRoadmapPrivate>("roadmaps")
      .select("id", "name", "display", "url", "color", "created_at", "index")
      .where("id", id)
      .first();
  }
}
