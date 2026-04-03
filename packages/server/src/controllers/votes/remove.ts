import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IRemoveVoteRequestBody,
  TPermission,
  TRemoveVoteResponseBody,
} from "@logchimp/types";

// services
import { getVotes } from "../../services/votes/getVotes";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { validUUID } from "../../helpers";
import { VoteService } from "../../services/votes/vote.service";

type ResponseBody = TRemoveVoteResponseBody | IApiErrorResponse;

export async function remove(
  req: Request<unknown, unknown, IRemoveVoteRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const userId = req.user.userId;
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];
  const checkPermission = permissions.includes("vote:destroy");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  const postId = validUUID(req.body.postId);

  const voteService = new VoteService();

  try {
    await voteService.retractVote(postId, userId);

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
