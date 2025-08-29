import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import type {
  IAddVoteRequestBody,
  IAddVoteResponseBody,
  IApiErrorResponse,
} from "@logchimp/types";

// database
import database from "../../database";

// services
import { getVotes } from "../../services/votes/getVotes";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { validUUID } from "../../helpers";

type ResponseBody = IAddVoteResponseBody | IApiErrorResponse;

export async function add(
  req: Request<unknown, unknown, IAddVoteRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-ignore
  const userId = req.user.userId;
  // @ts-ignore
  const permissions = req.user.permissions;
  const checkPermission = permissions.includes("vote:create");

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

    if (vote) {
      return res.status(409).send({
        message: error.api.votes.exists,
        code: "VOTE_EXISTS",
      });
    }

    await database
      .insert({
        voteId: uuidv4(),
        userId,
        postId,
      })
      .into("votes");

    const voters = await getVotes(postId, userId);

    res.status(201).send({ voters });
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
