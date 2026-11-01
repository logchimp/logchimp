import express from "express";
import type { operations } from "@logchimp/api-ts-types";

import { authRequired } from "../../../middlewares/auth/authRequired";
import { postExists } from "../../../middlewares/postExists";
import * as vote from "../../controllers/v1/vote";
import { withLicenseGuard } from "../../do-not-remove/middleware/licenseGuard";
import * as votes from "../../../controllers/votes";

const router = express.Router();

router.post("/votes", authRequired, postExists, votes.add);
router.delete("/votes", authRequired, postExists, votes.remove);

router.post<operations["addVoteOnBehalfOfUser"]["parameters"]["path"]>(
  "/posts/:post_id/votes/:user_id",
  authRequired,
  postExists,
  withLicenseGuard(vote.addVote, {
    requiredPlan: ["business", "enterprise"],
  }),
);
router.delete<operations["removeVoteOnBehalfOfUser"]["parameters"]["path"]>(
  "/posts/:post_id/votes/:user_id",
  authRequired,
  postExists,
  withLicenseGuard(vote.removeVote, {
    requiredPlan: ["business", "enterprise"],
  }),
);

export default router;
