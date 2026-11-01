import type { components } from "@logchimp/api-ts-types";

import { QueryRepository } from "../../repository/query";
import { DAY } from "../../cache/time";

export class RoadmapRepository extends QueryRepository {
  async GetPublicRoadmapByIDs(
    roadmapIds: string[],
  ): Promise<components["schemas"]["RoadmapItem"][]> {
    const keyPrefix = "roadmap:public";

    if (roadmapIds.length === 0) return [];

    const { results, missingIds } = await this.GetManyWithCached<
      components["schemas"]["RoadmapItem"]
    >({
      ids: roadmapIds,
      keyPrefix,
    });

    const dbResults = await this.db("roadmaps")
      .select<components["schemas"]["RoadmapItem"][]>(
        "id",
        "name",
        "url",
        "color",
      )
      .whereIn("id", missingIds);

    await this.CacheMissingResults<components["schemas"]["RoadmapItem"]>({
      idField: "id",
      keyPrefix,
      results: dbResults,
      ttlSeconds: DAY * 7,
    });

    return [...results, ...dbResults];
  }

  GetById(id: string) {
    return this.db<components["schemas"]["RoadmapPrivate"]>("roadmaps")
      .select("id", "name", "display", "url", "color", "created_at", "index")
      .where("id", id)
      .first();
  }
}
