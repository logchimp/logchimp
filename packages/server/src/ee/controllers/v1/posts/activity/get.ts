import type { Request, Response } from "express";
import type { Knex } from "knex";
import * as v from "valibot";
import type {
  IApiErrorResponse,
  IGetPostActivityRequestParam,
  IGetPostActivityRequestQuery,
  IGetPostActivityResponseBody,
  IPostActivity,
  TFilterPostActivityVisibility,
} from "@logchimp/types";

import database from "../../../../../database";
import logger from "../../../../../utils/logger";
import error from "../../../../../errorResponse.json";
import {
  parseAndValidateLimit,
  parseAndValidatePage,
} from "../../../../../helpers";
import { GET_COMMENTS_FILTER_COUNT } from "../../../../../constants";

type ResponseBody = IGetPostActivityResponseBody | IApiErrorResponse;

const FilterVisibilitySchema = v.picklist(["public", "internal"]);
const querySchema = v.object({
  limit: v.optional(
    v.pipe(
      v.string(),
      v.transform((value) =>
        parseAndValidateLimit(value, GET_COMMENTS_FILTER_COUNT),
      ),
    ),
  ),
  page: v.optional(
    v.pipe(
      v.string(),
      v.transform((value) => parseAndValidatePage(value)),
    ),
  ),
  visibility: v.optional(
    v.pipe(
      v.string(),
      v.transform((value) => (value ? value.split(",") : [])),
      v.array(FilterVisibilitySchema),
    ),
  ),
});

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

  const query = v.safeParse(querySchema, req.query);
  if (!query.success) {
    res.status(400).send({
      code: "VALIDATION_ERROR",
      message: "Invalid query parameters",
      errors: query.issues.map((issue) => ({
        ...issue,
        message: issue.message,
        code: issue.message,
      })),
    });
    return;
  }

  const limit = query.output.limit ?? GET_COMMENTS_FILTER_COUNT;

  // @ts-expect-error
  const permissions = (req?.user?.permissions || []) as TPermission[];
  const hasPermission = permissions.includes("comment:view_internal");

  try {
    const activities = await getActivityQuery({
      postId: post_id,
      limit,
      page: query.output.page,
      visibility: query.output.visibility,
      hasPermission,
      // @ts-expect-error
      subscription: req?.subscription,
    });

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

interface Sub {
  hierarchy?: number;
}

interface IPostCommentVisibilityOptions {
  visibility: Array<TFilterPostActivityVisibility>;
  hasPermission?: boolean;
  subscription?: Sub;
}

interface IGetActivityQuery extends IPostCommentVisibilityOptions {
  postId: string;
  limit: number;
  page: number;
}

function getActivityQuery({
  postId,
  limit,
  page,
  visibility,
  subscription,
  hasPermission,
}: IGetActivityQuery) {
  let query = database
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
    .where("posts_activity.post_id", postId)
    .orderBy("posts_activity.created_at", "desc")
    .limit(limit)
    .offset(limit * (page - 1));

  if (subscription?.hierarchy === 1) {
    query = query.where("posts_activity.type", "comment");
  }

  query = postCommentVisibility(query, {
    visibility,
    hasPermission,
    subscription,
  });

  return query;
}

function postCommentVisibility<T>(
  query: Knex.QueryBuilder<T>,
  {
    visibility = [],
    hasPermission = false,
    subscription,
  }: IPostCommentVisibilityOptions,
): Knex.QueryBuilder<T> {
  const showInternal = () => query.where("posts_comments.is_internal", true);
  const showPublic = () => query.where("posts_comments.is_internal", false);

  if (visibility.length === 0) {
    return showPublic();
  }

  if (subscription?.hierarchy >= 2) {
    if (!hasPermission) {
      return showPublic();
    }

    if (visibility.includes("internal")) {
      return showInternal();
    }

    if (visibility.includes("public")) {
      return showPublic();
    }

    return query;
  }

  return showPublic();
}
