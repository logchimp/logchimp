import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IGetPostActivityRequestParam,
  IGetPostActivityRequestQuery,
  IGetPostActivityResponseBody,
} from "@logchimp/types";

import database from "../../../../../database";

// utils
import logger from "../../../../../utils/logger";
import error from "../../../../../errorResponse.json";
import {
  parseAndValidateLimit,
  parseAndValidatePage,
} from "../../../../../helpers";
import { GET_COMMENTS_FILER_COUNT } from "../../../../../constants";

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
    GET_COMMENTS_FILER_COUNT,
  );
  const page = parseAndValidatePage(req.query.page);

  try {
    const activities = await database.raw(
      /* SQL */
      `
      SELECT
        id,
        type,
        CASE
          WHEN posts_comments_id IS NULL THEN NULL
          ELSE (
            SELECT
              json_build_object(
                'id', posts_comments.id,
                'parent_id', posts_comments.parent_id,
                'body', posts_comments.body,
                'is_internal', posts_comments.is_internal,
                'is_edited', posts_comments.is_edited,
                'is_spam', posts_comments.is_spam,
                'created_at', posts_comments.created_at
              )
            FROM posts_comments
            WHERE posts_comments.activity_id = posts_activity.id
          )
        END AS comment,
        (
          SELECT
            json_build_object(
              'user_id', users."userId",
              'name', users.name,
              'username', users.username,
              'avatar', users.avatar
            )
          FROM users WHERE users."userId" = posts_activity.author_id
        ) AS author,
        created_at
      FROM
        posts_activity
      WHERE
        posts_activity.post_id = :post_id
      ORDER BY
        posts_activity.created_at DESC
      LIMIT :limit
      OFFSET :offset
    ;`,
      {
        limit,
        offset: limit * (page - 1),
        post_id,
      },
    );

    res.status(200).send({
      activity: activities.rows,
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
