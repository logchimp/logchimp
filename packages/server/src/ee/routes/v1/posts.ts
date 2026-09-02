import express from "express";
import type {
  ICreatePostCommentRequestBody,
  IGetPostActivityRequestParam,
  IGetPostActivityRequestQuery,
  IGetPostVotesRequestParams,
  IUpdatePostCommentRequestBody,
  IUpdatePostCommentRequestParam,
  TCreatePostCommentRequestParam,
  TDeletePostCommentRequestParam,
} from "@logchimp/types";

// controller
import * as post from "../../../controllers/post";
import * as eePost from "../../controllers/v1/posts";

// middleware
import { authOptional, authRequired } from "../../../middlewares/auth";
import { withLicenseGuard } from "../../do-not-remove/middleware/licenseGuard";
import { postExists } from "../../../middlewares/postExists";
import { commentExists } from "../../middleware/commentExists";

const router = express.Router();

router.post("/posts/get", authOptional, eePost.posts.filterPost);
router.post("/posts/slug", authOptional, postExists, post.postBySlug);

router.post("/posts", authRequired, post.create);
router.patch("/posts", authRequired, postExists, eePost.posts.updatePost);

// votes
router.get<IGetPostVotesRequestParams>(
  "/posts/:post_id/votes",
  // @ts-expect-error
  authOptional,
  postExists,
  post.getPostVotes,
);

router.delete("/posts", authRequired, postExists, post.deleteById);

// post activity
router.get<
  IGetPostActivityRequestParam,
  unknown,
  unknown,
  IGetPostActivityRequestQuery
>(
  "/posts/:post_id/activity",
  // @ts-expect-error
  authOptional,
  postExists,
  withLicenseGuard(eePost.activity.get, {
    // pro <= comments
    // business <= activity (post status changed)
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);

// post comment
router.post<
  TCreatePostCommentRequestParam,
  unknown,
  ICreatePostCommentRequestBody
>(
  "/posts/:post_id/comments",
  // @ts-expect-error
  authRequired,
  postExists,
  withLicenseGuard(eePost.comments.create, {
    // pro <= public comment
    // business <= internal comment
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);
router.put<
  IUpdatePostCommentRequestParam,
  unknown,
  IUpdatePostCommentRequestBody
>(
  "/posts/:post_id/comments/:comment_id",
  // @ts-expect-error
  authRequired,
  postExists,
  commentExists,
  withLicenseGuard(eePost.comments.update, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);
router.delete<TDeletePostCommentRequestParam>(
  "/posts/:post_id/comments/:comment_id",
  // @ts-expect-error
  authRequired,
  postExists,
  commentExists,
  withLicenseGuard(eePost.comments.destroy, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);

export default router;
