import type { Request, Response } from "express";
import type {
  IAddVoteRequestParams,
  IAddVoteV2ResponseBody,
  IApiErrorResponse,
  IPublicUserInfo,
  TPermission,
  TRemoveVoteRequestParams,
} from "@logchimp/types";

import error from "../../../errorResponse.json";
import { validUUID } from "../../../helpers";
import logger from "../../../utils/logger";
import { VoteService } from "../../../services/votes/vote.service";
import type { IAuthenticationMiddlewareUser } from "../../../types";
import { ConflictError, NotFoundError } from "../../../utils/error";
import database from "../../../database";

type AddVoteResponseBody = IAddVoteV2ResponseBody | IApiErrorResponse;

export async function addVote(
  req: Request<IAddVoteRequestParams>,
  res: Response<AddVoteResponseBody>,
) {
  const onBehalfOfUserId = (req.params.user_id ?? "").trim();
  if (!onBehalfOfUserId) {
    res.status(400).send({
      message: error.api.votes.userIdMissing,
      code: "MISSING_USER_ID",
    });
    return;
  }

  // @ts-expect-error
  const permissions = (req.user as IAuthenticationMiddlewareUser)
    .permissions as TPermission[];
  const checkPermission = permissions.includes("vote:assign");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  const postId = validUUID(req.params.post_id);
  const voteService = new VoteService();

  try {
    const getUser = await database
      .select<IPublicUserInfo>("userId", "name", "avatar", "username")
      .from("users")
      .where({
        userId: onBehalfOfUserId,
      })
      .first();

    if (!getUser?.userId) {
      res.status(404).send({
        message: error.middleware.user.userNotFound,
        code: "USER_NOT_FOUND",
      });
      return;
    }

    const voteId = await voteService.castVote(postId, onBehalfOfUserId);

    res.status(200).send({
      vote: {
        voteId,
        user: {
          userId: getUser.userId,
          name: getUser.name,
          avatar: getUser.avatar,
          username: getUser.username,
        },
      },
    });
  } catch (err) {
    if (err instanceof ConflictError) {
      res.status(409).send({
        message: err.message,
        code: err.code,
      });
      return;
    }

    logger.error({
      message: "failed to assign user's vote to post in DB",
      error: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}

type RemoveVoteResponseBody = IApiErrorResponse;

export async function removeVote(
  req: Request<TRemoveVoteRequestParams>,
  res: Response<RemoveVoteResponseBody>,
) {
  const onBehalfOfUserId = (req.params.user_id ?? "").trim();
  if (!onBehalfOfUserId) {
    res.status(400).send({
      message: error.api.votes.userIdMissing,
      code: "MISSING_USER_ID",
    });
    return;
  }

  // @ts-expect-error
  const permissions = (req.user as IAuthenticationMiddlewareUser)
    .permissions as TPermission[];
  const checkPermission = permissions.includes("vote:unassign");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  const postId = validUUID(req.params.post_id);
  const voteService = new VoteService();

  try {
    const getUser = await database
      .select<{
        userId: string;
      }>("userId")
      .from("users")
      .where({
        userId: onBehalfOfUserId,
      })
      .first();

    if (!getUser?.userId) {
      res.status(404).send({
        message: error.middleware.user.userNotFound,
        code: "USER_NOT_FOUND",
      });
      return;
    }

    await voteService.retractVote(postId, onBehalfOfUserId);

    res.status(202).send();
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).send({
        message: err.message,
        code: err.code,
      });
      return;
    }

    logger.error({
      message: "failed to assign user's vote to post in DB",
      error: err,
    });
    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
