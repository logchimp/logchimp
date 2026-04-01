import express from "express";
import type {
  IAddVoteRequestParams,
  TRemoveVoteRequestParams,
} from "@logchimp/types";
const router = express.Router();

import { authRequired } from "../../../middlewares/auth/authRequired";
import { postExists } from "../../../middlewares/postExists";
import * as vote from "../../controllers/v1/vote";
import { withLicenseGuard } from "../../do-not-remove/middleware/licenseGuard";

router.post<IAddVoteRequestParams>(
  "/posts/:post_id/votes/:user_id",
  // @ts-expect-error
  authRequired,
  postExists,
  withLicenseGuard(vote.addVote, {
    requiredPlan: ["business", "enterprise"],
  }),
);
router.delete<TRemoveVoteRequestParams>(
  "/posts/:post_id/votes/:user_id",
  // @ts-expect-error
  authRequired,
  postExists,
  withLicenseGuard(vote.removeVote, {
    requiredPlan: ["business", "enterprise"],
  }),
);

export default router;
