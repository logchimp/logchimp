// modules
const { nanoid } = require("nanoid");
const { v4: uuidv4 } = require("uuid");

const database = require("../../database");

// utils
const { validUUID } = require("../../helpers");
const logger = require("../../utils/logger");

const error = require("../../errorResponse.json");

exports.create = async (req, res) => {
  const userId = req.user.userId;
  const permissions = req.user.permissions;

  const title = req.body.title;
  const contentMarkdown = req.body.contentMarkdown;
  const boardId = validUUID(req.body.boardId);

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
    })

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    })
  }
};
