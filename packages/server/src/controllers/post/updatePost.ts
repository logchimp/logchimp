import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IUpdatePostRequestBody,
  TPermission,
  TUpdatePostResponseBody,
} from "@logchimp/types";
import * as v from "valibot";
import database from "../../database";

// utils
import { validUUID } from "../../helpers";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

type ResponseBody = TUpdatePostResponseBody | IApiErrorResponse;

const bodySchema = v.object({
  title: v.message(
    v.pipe(v.optional(v.string(), ""), v.trim(), v.nonEmpty()),
    "POST_TITLE_MISSING",
  ),
  contentMarkdown: v.optional(v.nullable(v.pipe(v.string(), v.trim()))),
});

const schemaBodyErrorMap = {
  POST_TITLE_MISSING: error.api.posts.titleMissing,
};

export async function updatePost(
  req: Request<unknown, unknown, IUpdatePostRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const userId = req.user.userId;
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];
  // @ts-expect-error
  const authorId = req.post.userId;
  // @ts-expect-error
  const slugId = req.post.slugId;

  const checkPermission = permissions.includes("post:update");
  if (!checkPermission && userId !== authorId) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  const body = v.safeParse(bodySchema, req.body);
  if (!body.success) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid body parameters",
      errors: body.issues.map((issue) => ({
        ...issue,
        message: schemaBodyErrorMap[issue.message]
          ? schemaBodyErrorMap[issue.message]
          : undefined,
        code: issue.message,
      })),
    });
  }

  const id = validUUID(req.body.id);
  const boardId = validUUID(req.body.boardId);
  const roadmapId = validUUID(req.body.roadmapId);
  const { title, contentMarkdown } = body.output;

  const slug = `${title
    .replace(/[^\w\s]/gi, "")
    .replace(/\s\s+/gi, " ")
    .toLowerCase()
    .split(" ")
    .join("-")}-${slugId}`;

  try {
    const posts = await database
      .update({
        title,
        slug,
        contentMarkdown,
        boardId,
        roadmap_id: roadmapId,
        updatedAt: new Date().toJSON(),
      })
      .from("posts")
      .where({
        postId: id,
      })
      .returning("*");

    const post = posts[0];

    res.status(200).send({ post });
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
