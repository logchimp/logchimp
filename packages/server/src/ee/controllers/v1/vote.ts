import type { Request, Response } from "express";
import type {
  IAddVoteRequestParams,
  IAddVoteResponseBody,
  IApiErrorResponse,
  TPermission,
  TRemoveVoteRequestParams,
  TRemoveVoteResponseBody,
} from "@logchimp/types";

import error from "../../../errorResponse.json";
import { validUUID } from "../../../helpers";
import logger from "../../../utils/logger";
import { VoteService } from "../../../services/votes/vote.service";
import { getVotes } from "../../../services/votes/getVotes";
import type { IAuthenticationMiddlewareUser } from "../../../types";

type AddVoteResponseBody = IAddVoteResponseBody | IApiErrorResponse;

export async function addVote(
  req: Request<IAddVoteRequestParams>,
  res: Response<AddVoteResponseBody>,
) {
  // @ts-expect-error
  const authUserId = (req.user as IAuthenticationMiddlewareUser).userId;

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
    await voteService.castVote(postId, onBehalfOfUserId);

    const voters = await getVotes(postId, authUserId);

    res.status(200).send({
      voters,
    });
  } catch (e) {
    logger.error({
      message: "failed to assign user's vote to post in DB",
      error: e,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}

type RemoveVoteResponseBody = TRemoveVoteResponseBody | IApiErrorResponse;

export async function removeVote(
  req: Request<TRemoveVoteRequestParams>,
  res: Response<RemoveVoteResponseBody>,
) {
  // @ts-expect-error
  const authUserId = (req.user as IAuthenticationMiddlewareUser).userId;

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
    await voteService.retractVote(postId, onBehalfOfUserId);

    const voters = await getVotes(postId, authUserId);

    res.status(200).send({
      voters,
    });
  } catch (e) {
    logger.error({
      message: "failed to assign user's vote to post in DB",
      error: e,
    });
    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
