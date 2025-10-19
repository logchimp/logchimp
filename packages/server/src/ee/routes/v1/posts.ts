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
import { licenseGuard } from "../../middleware/licenseGuard";

// post activity
router.get<
  IGetPostActivityRequestParam,
  unknown,
  unknown,
  IGetPostActivityRequestQuery
>(
  "/posts/:post_id/activity",
  // @ts-expect-error
  licenseGuard,
  post.activity.get,
);

// post comment
router.post<TCreatePostCommentRequestParam>(
  "/posts/:post_id/comments",
  // @ts-expect-error
  licenseGuard,
  authRequired,
  post.comments.create,
);
router.put<IUpdatePostCommentRequestParam>(
  "/posts/:post_id/comments/:comment_id",
  // @ts-expect-error
  licenseGuard,
  authRequired,
  post.comments.update,
);
router.delete<TDeletePostCommentRequestParam>(
  "/posts/:post_id/comments/:comment_id",
  // @ts-expect-error
  licenseGuard,
  authRequired,
  post.comments.destroy,
);

export default router;
