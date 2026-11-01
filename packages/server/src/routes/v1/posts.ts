import express from "express";
import type { operations } from "@logchimp/api-ts-types";

// controller
import * as post from "../../controllers/post";

// middleware
import { authOptional, authRequired } from "../../middlewares/auth";
import { postExists } from "../../middlewares/postExists";

const router = express.Router();

router.post("/posts/get", authOptional, post.filterPost);
router.post("/posts/slug", authOptional, postExists, post.postBySlug);

router.post("/posts", authRequired, post.create);
router.patch("/posts", authRequired, postExists, post.updatePost);

// votes
router.get<operations["getPostVotes"]["parameters"]["path"]>(
  "/posts/:post_id/votes",
  authOptional,
  postExists,
  post.getPostVotes,
);

router.delete("/posts", authRequired, postExists, post.deleteById);

export default router;
