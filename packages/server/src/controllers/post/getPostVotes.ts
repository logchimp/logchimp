import type { Request, Response } from "express";
import * as v from "valibot";
import type {
  IApiErrorResponse,
  IGetPostVotesRequestParams,
  IPaginatedPostVotesResponse,
  IUserVoteV2,
} from "@logchimp/types";
import { GET_POST_VOTES_COUNT } from "../../constants";
import { parseAndValidateLimit } from "../../helpers";
import error from "../../errorResponse.json";
import { VoteService } from "../../services/votes/vote.service";
import type { IAuthenticationMiddlewareUser } from "../../types";

type ResponseBody = IPaginatedPostVotesResponse | IApiErrorResponse;

const querySchema = v.object({
  first: v.pipe(
    v.optional(v.string(), GET_POST_VOTES_COUNT.toString()),
    v.transform((value) => parseAndValidateLimit(value, GET_POST_VOTES_COUNT)),
    v.number(),
    v.minValue(1, "MIN_VALUE_1"),
  ),
  after: v.optional(v.pipe(v.string(), v.uuid("INVALID_CURSOR"))),
});

const schemaQueryErrorMap = {
  INVALID_CURSOR: error.general.invalidCursor,
  MIN_VALUE_1: error.general.minValue1,
};

export async function getPostVotes(
  req: Request<IGetPostVotesRequestParams>,
  res: Response<ResponseBody>,
) {
  const query = v.safeParse(querySchema, req.query);
  if (!query.success) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid query parameters",
      errors: query.issues.map((issue) => ({
        ...issue,
        message: schemaQueryErrorMap[issue.message]
          ? schemaQueryErrorMap[issue.message]
          : undefined,
        code: issue.message,
      })),
    });
    return;
  }

  const { first, after } = query.output;
  // @ts-expect-error
  const postId = req.post.postId as string;
  // @ts-expect-error
  const userId = (req.user as IAuthenticationMiddlewareUser)?.userId;

  const voteService = new VoteService();

  try {
    const data = await voteService.getVotes({
      postId,
      options: {
        first,
        after,
      },
    });

    let viewerVote: IUserVoteV2 | undefined;
    if (userId) {
      viewerVote = await voteService.getUserVote(postId, userId);
    }

    res.status(200).send({
      votes: {
        ...data,
        viewerVote,
      },
    });
  } catch (err) {
    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
