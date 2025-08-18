import type { Request, Response } from "express";
import { nanoid } from "nanoid";
import { v4 as uuidv4 } from "uuid";

import database from "../../database";

// utils
import { validUUID } from "../../helpers";
import logger from "../../utils/logger";

import error from "../../errorResponse.json";
import { createPostSchema } from "./zodValidation";

export async function create(req: Request, res: Response) {
  // @ts-ignore
  const userId = req.user.userId;
  // @ts-ignore
  const permissions = req.user.permissions;

  const response = createPostSchema.safeParse(req.body);
  if(!response.success){
    return res.status(400).json({
      message:error.api.error.missed
    })
  }
  const {title, contentMarkdown, boardid} = response.data || req.body
  const boardId = validUUID(boardid);

  const checkPermission = permissions.includes("post:create");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  if (!(title && boardId)) {
    return res.status(400).send({
      errors: [
        title
          ? ""
          : {
              message: error.api.posts.titleMissing,
              code: "POST_TITLE_MISSING",
            },
        boardId
          ? ""
          : {
              message: error.api.boards.boardIdMissing,
              code: "BOARD_ID_MISSING",
            },
      ],
    });
  }

  // generate slug unique identification
  const slugId = nanoid(20);

  const slug = `${title
    .replace(/[^\w\s]/gi, "")
    .replace(/\s\s+/gi, " ")
    .toLowerCase()
    .split(" ")
    .join("-")}-${slugId}`;

  try {
    const createPost = await database
      .insert({
        postId: uuidv4(),
        title,
        slug,
        slugId,
        contentMarkdown,
        userId,
        boardId,
      })
      .into("posts")
      .returning("*");

    const post = createPost[0];

    await database
      .insert({
        voteId: uuidv4(),
        userId,
        postId: post.postId,
      })
      .into("votes");

    res.status(201).send({
      post,
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
