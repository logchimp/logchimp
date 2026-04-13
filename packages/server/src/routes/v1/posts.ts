// modules
import express from "express";
import type { IGetPostVotesRequestParams } from "@logchimp/types";

const router = express.Router();

// controller
import * as post from "../../controllers/post";

// middleware
import { authOptional, authRequired } from "../../middlewares/auth";
import { postExists } from "../../middlewares/postExists";

router.post("/posts/get", authOptional, post.filterPost);
router.post("/posts/slug", authOptional, postExists, post.postBySlug);

router.post("/posts", authRequired, post.create);
router.patch("/posts", authRequired, postExists, post.updatePost);

// votes
router.get<IGetPostVotesRequestParams>(
  "/posts/:post_id/votes",
  // @ts-expect-error
  authOptional,
  postExists,
  post.getPostVotes,
);

router.delete("/posts", authRequired, postExists, post.deleteById);

export default router;
