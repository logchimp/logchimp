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
import * as middleware from "../../../middlewares";

// post activity
router.get<
  IGetPostActivityRequestParam,
  unknown,
  unknown,
  IGetPostActivityRequestQuery
>("/posts/:post_id/activity", post.activity.get);

// post comment
router.post<TCreatePostCommentRequestParam>(
  "/posts/:post_id/comments",
  // @ts-expect-error
  middleware.apiAuth,
  post.comments.create,
);
router.put<IUpdatePostCommentRequestParam>(
  "/posts/:post_id/comments/:comment_id",
  // @ts-expect-error
  middleware.apiAuth,
  post.comments.update,
);
router.delete<TDeletePostCommentRequestParam>(
  "/posts/:post_id/comments/:comment_id",
  // @ts-expect-error
  middleware.apiAuth,
  post.comments.destroy,
);

export default router;
