import type { IRoadmapPrivate } from "@logchimp/types";

import type { IPostRoadmapChangeEvent } from "./types";
import database from "../../database";
import { mailQueue } from "../../worker/tasks/mail";
import type { ISendPostRoadmapChangeMailPayload } from "../mail/types";

export async function postRoadmapChangeEvent(payload: IPostRoadmapChangeEvent) {
  try {
    const getPostRoadmap = await database
      .select<
        {
          title: string;
          contentMarkdown: string | null;
        } & IRoadmapPrivate
      >(
        "p.title",
        "p.contentMarkdown",
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
      .where("p.postId", payload.postId)
      .first();

    if (!getPostRoadmap) {
      return;
    }

    const getVoters = await database
      .select<
        Array<{
          name: string | null;
          email: string;
          username: string;
        }>
      >("u.name", "u.email", "u.username")
      .from("votes as v")
      .innerJoin("users as u", "v.userId", "u.userId")
      .where({
        "v.postId": payload.postId,
        "u.isBlocked": false,
      });

    if (getVoters.length === 0) {
      return;
    }

    console.log(
      `Post (ID: ${payload.postId}) has ${getVoters.length} upvoters`,
    );

    const sendPostRoadmapChangeMailPayload: Array<ISendPostRoadmapChangeMailPayload> =
      [];
    for (let i = 0; i < getVoters.length; i++) {
      sendPostRoadmapChangeMailPayload.push({
        displayName: getVoters[i].name || getVoters[i].username,
        recipientEmail: getVoters[i].email,
        postTitle: getPostRoadmap.title,
        postDescription: getPostRoadmap.contentMarkdown,
        roadmapTitle: getPostRoadmap.name,
        roadmapColor: getPostRoadmap.color,
      });
    }
    await mailQueue.sendPostRoadmapChangeMail(sendPostRoadmapChangeMailPayload);
  } catch (error) {
    throw new Error(error);
  }
}
