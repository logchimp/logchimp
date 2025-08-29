import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IRemoveVoteRequestBody,
  TRemoveVoteResponseBody,
} from "@logchimp/types";
import database from "../../database";

// services
import { getVotes } from "../../services/votes/getVotes";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { validUUID } from "../../helpers";

type ResponseBody = TRemoveVoteResponseBody | IApiErrorResponse;

export async function remove(
  req: Request<unknown, unknown, IRemoveVoteRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-ignore
  const userId = req.user.userId;
  // @ts-ignore
  const permissions = req.user.permissions;
  const checkPermission = permissions.includes("vote:destroy");

  const postId = validUUID(req.body.postId);
  if (!postId) {
    res.status(400).send({
      message: "Invalid Post ID",
      code: "INVALID_POST_ID",
    });
    return;
  }

  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    const vote = await database
      .select()
      .from("votes")
      .where({
        postId: postId || null,
        userId,
      })
      .first();

    if (!vote) {
      return res.status(404).send({
        message: error.api.votes.voteNotFound,
        code: "VOTE_NOT_FOUND",
      });
    }

    await database.delete().from("votes").where({
      postId,
      userId,
    });

    const voters = await getVotes(postId, userId);

    res.status(200).send({ voters });
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
