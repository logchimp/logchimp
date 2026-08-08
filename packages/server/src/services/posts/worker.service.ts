import type { IRoadmapPrivate } from "@logchimp/types";

import type { IPostRoadmapChangeEvent } from "./types";
import database from "../../database";

export async function postRoadmapChangeEvent(payload: IPostRoadmapChangeEvent) {
  try {
    const getRoadmap = await database
      .select<IRoadmapPrivate>(
        "r.id",
        "r.name",
        "r.display",
        "r.url",
        "r.color",
        "r.created_at",
        "r.index",
      )
      .from("posts as p")
      .innerJoin("roadmaps as r", "p.roadmap_id", "r.id")
      .where("p.id", payload.postId)
      .first();

    if (!getRoadmap) {
      return;
    }

    const getVoters = await database
      .select<Array<{ userId: string }>>("u.name", "u.email", "u.username")
      .from("votes as v")
      .innerJoin("users as u", "v.user_id", "u.id")
      .where({
        "v.post_id": payload.postId,
        "u.isBlocked": false,
      });

    if (getVoters.length === 0) {
      return;
    }

    console.log(
      `Post (ID: ${payload.postId}) has ${getVoters.length} upvoters`,
    );

    // TODO: queue send post roadmap change mail
  } catch (error) {
    throw new Error(error);
  }
}
