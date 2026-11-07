import express from "express";
import type { components, operations } from "@logchimp/api-ts-types";

// controller
import * as post from "../../../controllers/post";
import * as eePost from "../../controllers/v1/posts";

// middleware
import { authOptional, authRequired } from "../../../middlewares/auth";
import { withLicenseGuard } from "../../do-not-remove/middleware/licenseGuard";
import { postExists } from "../../../middlewares/postExists";
import { commentExists } from "../../middleware/commentExists";

const router = express.Router();

router.post<
  unknown,
  unknown,
  components["schemas"]["GetFilterPostRequestBody"],
  operations["filterPosts"]["parameters"]["query"]
>(
  "/posts/get",
  authOptional,
  withLicenseGuard(eePost.posts.filterPost, {
    requiredPlan: ["pro", "business", "enterprise"],
    skipHandlerOnFailure: false,
  }),
);
router.post("/posts/slug", authOptional, postExists, eePost.posts.postBySlug);

router.post("/posts", authRequired, eePost.posts.createPost);
router.patch(
  "/posts",
  authRequired,
  postExists,
  withLicenseGuard(eePost.posts.updatePost, {
    requiredPlan: ["pro", "business", "enterprise"],
    skipHandlerOnFailure: false,
  }),
);

// votes
router.get<
  operations["getPostVotes"]["parameters"]["path"],
  unknown,
  unknown,
  operations["getPostVotes"]["parameters"]["query"]
>("/posts/:post_id/votes", authOptional, postExists, post.getPostVotes);

router.delete("/posts", authRequired, postExists, post.deleteById);

// post activity
router.get<
  operations["getPostActivity"]["parameters"]["path"],
  unknown,
  unknown,
  operations["getPostActivity"]["parameters"]["query"]
>(
  "/posts/:post_id/activity",
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
  operations["postComment"]["parameters"]["path"],
  unknown,
  components["schemas"]["CreatePostCommentRequestBody"]
>(
  "/posts/:post_id/comments",
  authRequired,
  postExists,
  withLicenseGuard(eePost.comments.create, {
    // pro <= public comment
    // business <= internal comment
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);
router.put<
  operations["updateComment"]["parameters"]["path"],
  unknown,
  components["schemas"]["UpdatePostCommentRequestBody"]
>(
  "/posts/:post_id/comments/:comment_id",
  authRequired,
  postExists,
  commentExists,
  withLicenseGuard(eePost.comments.update, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);
router.delete<operations["deleteComment"]["parameters"]["path"]>(
  "/posts/:post_id/comments/:comment_id",
  authRequired,
  postExists,
  commentExists,
  withLicenseGuard(eePost.comments.destroy, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);

export default router;
