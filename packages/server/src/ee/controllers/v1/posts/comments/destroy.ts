import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  TDeletePostCommentRequestParam,
  TPermission,
} from "@logchimp/types";
import database from "../../../../../database";

// utils
import logger from "../../../../../utils/logger";
import error from "../../../../../errorResponse.json";
import type { GetCommentStatement } from "../../../../middleware/commentExists";

/**
 * Comment delete endpoint.
 *
 * `post_id` param and `comment_id` param are validated in their respective middlewares.
 */
export async function destroy(
  req: Request<TDeletePostCommentRequestParam>,
  res: Response<IApiErrorResponse>,
) {
  const { comment_id, post_id } = req.params;

  // @ts-expect-error
  const comment = req?.comment as GetCommentStatement | undefined;
  if (!comment) {
    res.status(404).send({
      message: error.api.comments.commentNotFound,
      code: "COMMENT_NOT_FOUND",
    });
    return;
  }

  // @ts-expect-error
  const subscription = req?.subscription;
  if (!(subscription?.hierarchy >= (comment.is_internal ? 2 : 1))) {
    res.status(403).send({
      message: error.middleware.license.higherPlan,
      code: "LICENSE_INSUFFICIENT_TIER",
    });
    return;
  }

  // @ts-expect-error
  const userId = req.user?.userId as string | undefined;

  // @ts-expect-error
  const permissions = (req.user?.permissions || []) as TPermission[];
  const requiredPermission = [
    "comment:delete:own",
    "comment:delete:any",
  ] satisfies TPermission[];
  const hasPermission = requiredPermission.some((permission) =>
    permissions.includes(permission),
  );
  if (!hasPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  if (
    comment.is_internal &&
    !(
      permissions.includes("comment:view_internal") &&
      permissions.includes("comment:delete:any")
    )
  ) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  const ownComment = permissions.includes(
    "comment:delete:own" satisfies TPermission,
  );
  if (ownComment && !permissions.includes("comment:delete:any")) {
    let isAuthor: { id: string } | undefined;
    try {
      isAuthor = await database
        .select<{ id: string }>("id")
        .from("posts_activity")
        .where({
          type: "comment",
          posts_comments_id: comment_id,
          author_id: userId,
        })
        .first();
    } catch (err) {
      logger.error({
        level: "error",
        message: "failed to check if user is author of comment",
        err,
      });
      res.status(500).send({
        message: error.general.serverError,
        code: "SERVER_ERROR",
      });
      return;
    }

    if (!isAuthor?.id) {
      res.status(403).send({
        message: error.api.comments.notAnAuthor,
        code: "UNAUTHORIZED_NOT_AUTHOR",
      });
      return;
    }
  }

  try {
    await commentDeleteStatement(post_id, comment_id);

    res.sendStatus(204);
  } catch (err) {
    logger.error({
      level: "error",
      message: "Error deleting comment",
      err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}

async function commentDeleteStatement(postId: string, commentId: string) {
  await database.transaction(async (trx) => {
    await trx.delete().from("posts_activity").where({
      post_id: postId,
      posts_comments_id: commentId,
    });
    await trx.delete().from("posts_comments").where({ id: commentId });
  });
}
