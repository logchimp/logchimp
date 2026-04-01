import type { Request, Response } from "express";
import type {
  IAddVoteRequestParams,
  TRemoveVoteRequestParams,
} from "@logchimp/types";

export function addVote(req: Request<IAddVoteRequestParams>, res: Response) {}

export function removeVote(
  req: Request<TRemoveVoteRequestParams>,
  res: Response,
) {}

export default {
  addVote,
  removeVote,
};
