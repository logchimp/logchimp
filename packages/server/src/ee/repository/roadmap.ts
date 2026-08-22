import type { Knex } from "knex";
import type { IRoadmapPrivate } from "@logchimp/types";

export function getById(db: Knex, id: string) {
  return db<IRoadmapPrivate>("roadmaps")
    .select("id", "name", "display", "url", "color", "created_at", "index")
    .where("id", id)
    .first();
}
