import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IGetPostActivityRequestParam,
  IGetPostActivityRequestQuery,
  IGetPostActivityResponseBody,
  IPostActivity,
} from "@logchimp/types";

import database from "../../../../../database";

// utils
import logger from "../../../../../utils/logger";
import error from "../../../../../errorResponse.json";
import {
  parseAndValidateLimit,
  parseAndValidatePage,
} from "../../../../../helpers";
import { GET_COMMENTS_FILTER_COUNT } from "../../../../../constants";

type ResponseBody = IGetPostActivityResponseBody | IApiErrorResponse;

export async function get(
  req: Request<
    IGetPostActivityRequestParam,
    unknown,
    unknown,
    IGetPostActivityRequestQuery
  >,
  res: Response<ResponseBody>,
) {
  const { post_id } = req.params;
  const limit = parseAndValidateLimit(
    req.query.limit,
    GET_COMMENTS_FILTER_COUNT,
  );
  const page = parseAndValidatePage(req.query.page);

  try {
    const activities = await getActivityQuery({ postId: post_id, limit, page });

    res.status(200).send({
      activity: activities,
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}

interface IGetActivityQuery {
  postId: string;
  limit: number;
  page: number;
}

function getActivityQuery({ postId, limit, page }: IGetActivityQuery) {
  return database
    .leftJoin(
      "posts_comments",
      "posts_comments.activity_id",
      "posts_activity.id",
    )
    .leftJoin("users", "users.userId", "posts_activity.author_id")
    .select<Array<IPostActivity>>(
      "posts_activity.id",
      "posts_activity.type",
      "posts_activity.created_at",
      database.raw(`
        json_build_object(
          'id', posts_comments.id,
          'parent_id', posts_comments.parent_id,
          'body', posts_comments.body,
          'is_internal', posts_comments.is_internal,
          'is_edited', posts_comments.is_edited,
          'is_spam', posts_comments.is_spam,
          'created_at', posts_comments.created_at
        ) AS comment
      `),
      database.raw(`
        json_build_object(
          'user_id', users."userId",
          'name', users.name,
          'username', users.username,
          'avatar', users.avatar
        ) AS author
      `),
    )
    .from("posts_activity")
    .where({
      post_id: postId,
    })
    .orderBy("posts_activity.created_at", "desc")
    .limit(limit)
    .offset(limit * (page - 1));
}
