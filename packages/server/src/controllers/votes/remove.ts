import type { Request, Response } from "express";
import type { components } from "@logchimp/api-ts-types";

// services
import { getVotes } from "../../services/votes/getVotes";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { validUUID } from "../../helpers";
import { VoteService } from "../../services/votes/vote.service";
import { NotFoundError } from "../../utils/error";

type ResponseBody =
  | components["schemas"]["RemoveVoteResponseBody"]
  | components["schemas"]["GenericAPIErrorResponseBody"];

export async function remove(
  req: Request<
    unknown,
    unknown,
    components["schemas"]["RemoveVoteRequestBody"]
  >,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const userId = req.user.userId;
  // @ts-expect-error
  const permissions = req.user.permissions as Array<
    components["schemas"]["Permission"]
  >;
  const checkPermission = permissions.includes("vote:destroy");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  const postId = validUUID(req.body.postId);

  const voteService = new VoteService();

  try {
    await voteService.retractVote(postId, userId);

    const voters = await getVotes(postId, userId);

    res.status(200).send({ voters });
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).send({
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
