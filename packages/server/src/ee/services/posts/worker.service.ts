import type { IRoadmapPrivate } from "@logchimp/types";

import type { IPostRoadmapChangeEvent } from "./types";
import database from "../../../database";
import { decodeCursor, encodeCursor } from "../../../utils/cursor";
import type { ISendPostRoadmapChangeMailPayload } from "../mail/types";
import { mailQueue } from "../../worker/tasks/mail";
import { configManager } from "../../../utils/logchimpConfig";

const config = configManager.getConfig();

export async function postRoadmapChangeEvent(payload: IPostRoadmapChangeEvent) {
  const votersPaginationLimit = 100;

  try {
    const getPostRoadmap = await database
      .select<
        {
          title: string;
          contentMarkdown: string | null;
          slug: string;
        } & IRoadmapPrivate
      >(
        "p.title",
        "p.contentMarkdown",
        "p.slug",
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

    const totalCountQuery = await database
      .count()
      .from("votes")
      .where("postId", payload.postId)
      .first();

    const totalVotersCount =
      typeof totalCountQuery.count === "string"
        ? Number.parseInt(totalCountQuery?.count, 10)
        : totalCountQuery?.count;

    if (totalVotersCount === 0) {
      return;
    }

    console.log(
      `Post (ID: ${payload.postId}) has total ${totalVotersCount} upvoters.`,
    );

    let endCursor: string | null = null;
    let hasNextPage = true;
    while (hasNextPage) {
      type GetVotersResponse = {
        name: string | null;
        email: string;
        username: string;
        voteId: string;
        createdAt: string;
      };

      let getVoters: Array<GetVotersResponse> = [];

      let getVotersQuery = database
        .select("u.name", "u.email", "u.username", "v.voteId", "v.createdAt")
        .from("votes as v")
        .innerJoin("users as u", "v.userId", "u.userId")
        .where({
          "v.postId": payload.postId,
          "u.isBlocked": false,
        })
        .orderBy("v.createdAt", "desc")
        .orderBy("v.voteId", "desc")
        .limit(votersPaginationLimit + 1);

      if (endCursor) {
        const { id, createdAt } = decodeCursor(endCursor);
        getVotersQuery = getVotersQuery.where(function () {
          this.where("v.createdAt", "<", createdAt).orWhere(function () {
            this.where("v.createdAt", "=", createdAt).andWhere(
              "v.voteId",
              "<",
              id,
            );
          });
        });
      }

      getVoters = await getVotersQuery;
      const items = getVoters.slice(0, votersPaginationLimit);

      const urlObject = new URL(config.webUrl);
      const sendPostRoadmapChangeMailPayload: Array<ISendPostRoadmapChangeMailPayload> =
        [];
      for (let i = 0; i < items.length; i++) {
        if (!items[i]) continue;

        sendPostRoadmapChangeMailPayload.push({
          displayName: items[i].name || items[i].username,
          recipientEmail: items[i].email,
          postUrl: `${urlObject.origin}/posts/${getPostRoadmap.slug}`,
          postTitle: getPostRoadmap.title,
          postDescription: getPostRoadmap.contentMarkdown || "",
          roadmapTitle: getPostRoadmap.name,
          roadmapColor: getPostRoadmap.color,
        });
      }

      await mailQueue.sendPostRoadmapChangeMail(
        sendPostRoadmapChangeMailPayload,
      );

      hasNextPage = getVoters.length > votersPaginationLimit;
      if (hasNextPage) {
        const lastItem = items[items.length - 1];
        endCursor = encodeCursor(lastItem.createdAt, lastItem.voteId);
      } else {
        endCursor = null;
      }
    }
  } catch (error) {
    throw new Error(error);
  }
}
