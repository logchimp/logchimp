import type { Request, Response } from "express";
import type {
  IAddVoteRequestBody,
  IAddVoteResponseBody,
  IApiErrorResponse,
  TPermission,
} from "@logchimp/types";

// services
import { VoteService } from "../../services/votes/vote.service";
import { getVotes } from "../../services/votes/getVotes";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { validUUID } from "../../helpers";
import { ConflictError } from "../../utils/error";

type ResponseBody = IAddVoteResponseBody | IApiErrorResponse;

export async function add(
  req: Request<unknown, unknown, IAddVoteRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const userId = req.user.userId;
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];
  const checkPermission = permissions.includes("vote:create");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  const postId = validUUID(req.body.postId);

  const voteService = new VoteService();

  try {
    await voteService.castVote(postId, userId);

    const voters = await getVotes(postId, userId);

    res.status(201).send({ voters });
  } catch (err) {
    if (err instanceof ConflictError) {
      res.status(409).send({
        message: err.message,
        code: err.code,
      });
      return;
    }

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
