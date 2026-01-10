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
    // pro <= comments
    // business <= activity (post status changed)
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);

// post comment
router.post<TCreatePostCommentRequestParam>(
  "/posts/:post_id/comments",
  // @ts-expect-error
  authRequired,
  // @ts-expect-error
  withLicenseGuard(post.comments.create, {
    // pro <= public comment
    // business <= internal comment
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);
router.put<IUpdatePostCommentRequestParam>(
  "/posts/:post_id/comments/:comment_id",
  // @ts-expect-error
  authRequired,
  // @ts-expect-error
  withLicenseGuard(post.comments.update, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);
router.delete<TDeletePostCommentRequestParam>(
  "/posts/:post_id/comments/:comment_id",
  // @ts-expect-error
  authRequired,
  // @ts-expect-error
  withLicenseGuard(post.comments.destroy, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);

export default router;
