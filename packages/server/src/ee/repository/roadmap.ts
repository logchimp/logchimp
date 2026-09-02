import type { Knex } from "knex";
import type { IRoadmap, IRoadmapPrivate } from "@logchimp/types";

export class RoadmapRepository {
  db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  async GetRoadmapByIDs(roadmapIds: string[]): Promise<IRoadmap[]> {
    if (roadmapIds.length === 0) return [];
    return this.db<IRoadmap[]>("roadmaps")
      .select("id", "name", "url", "color")
      .whereIn("id", roadmapIds);
  }

  GetById(id: string) {
    return this.db<IRoadmapPrivate>("roadmaps")
      .select("id", "name", "display", "url", "color", "created_at", "index")
      .where("id", id)
      .first();
  }
}
