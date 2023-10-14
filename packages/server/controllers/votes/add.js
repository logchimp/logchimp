const { v4: uuidv4 } = require("uuid");

// database
const database = require("../../database");

// services
const getVotes = require("../../services/votes/getVotes");

// utils
const { validUUID } = require("../../helpers");
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

module.exports = async (req, res) => {
  const userId = req.user.userId;
  const permissions = req.user.permissions;
  const checkPermission = permissions.includes("vote:create");

  const postId = validUUID(req.body.postId);

  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    const vote = await database
      .select()
      .from("votes")
      .where({
        postId: postId || null,
        userId,
      })
      .first();

    if (vote) {
      return res.status(409).send({
        message: error.api.votes.exists,
        code: "VOTE_EXISTS",
      });
    }

    await database
      .insert({
        voteId: uuidv4(),
        userId,
        postId,
      })
      .into("votes");

    const voters = await getVotes(postId, userId);

    res.status(201).send({ voters });
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
