import express from "express";
import type {
  IGetPostActivityRequestParam,
  IGetPostActivityRequestQuery,
  IUpdatePostCommentRequestParam,
  TCreatePostCommentRequestParam,
  TDeletePostCommentRequestParam,
} from "@logchimp/types";

const router = express.Router();

// controller
import * as post from "../../../ee/controllers/v1/posts";

// middleware
import { authRequired } from "../../../middlewares/auth";
import { withLicenseGuard } from "../../do-not-remove/middleware/licenseGuard";

// post activity
router.get<
  IGetPostActivityRequestParam,
  unknown,
  unknown,
  IGetPostActivityRequestQuery
>(
  "/posts/:post_id/activity",
  // @ts-expect-error
  withLicenseGuard(post.activity.get, {
    // starter <= comments
    // growth <= activity (post status changed)
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);

// post comment
router.post<TCreatePostCommentRequestParam>(
  "/posts/:post_id/comments",
  // @ts-expect-error
  authRequired,
  // @ts-expect-error
  withLicenseGuard(post.comments.create, {
    // starter <= public comment
    // growth <= internal comment
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);
router.put<IUpdatePostCommentRequestParam>(
  "/posts/:post_id/comments/:comment_id",
  // @ts-expect-error
  authRequired,
  // @ts-expect-error
  withLicenseGuard(post.comments.update, {
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);
router.delete<TDeletePostCommentRequestParam>(
  "/posts/:post_id/comments/:comment_id",
  // @ts-expect-error
  authRequired,
  // @ts-expect-error
  withLicenseGuard(post.comments.destroy, {
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);

export default router;
