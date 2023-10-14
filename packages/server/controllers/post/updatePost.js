const database = require("../../database");

// utils
const { validUUID } = require("../../helpers");
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.updatePost = async (req, res) => {
  const userId = req.user.userId;
  const permissions = req.user.permissions;
  const authorId = req.post.userId;
  const slugId = req.post.slugId;

  const id = validUUID(req.body.id);
  const title = req.body.title;
  const contentMarkdown = req.body.contentMarkdown;
  const boardId = validUUID(req.body.boardId) || undefined;
  const roadmapId = validUUID(req.body.roadmapId) || undefined;

  const checkPermission = permissions.includes("post:update");
  if (!checkPermission && userId !== authorId) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  const slug = `${title
    .replace(/[^\w\s]/gi, "")
    .replace(/\s\s+/gi, " ")
    .toLowerCase()
    .split(" ")
    .join("-")}-${slugId}`;

  try {
    const posts = await database
      .update({
        title,
        slug,
        contentMarkdown,
        boardId,
        roadmap_id: roadmapId,
        updatedAt: new Date().toJSON(),
      })
      .from("posts")
      .where({
        postId: id,
      })
      .returning("*");

    const post = posts[0];

    res.status(200).send({ post });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    })
  }
};
