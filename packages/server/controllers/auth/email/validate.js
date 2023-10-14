// database
const database = require("../../../database");

// utils
const logger = require("../../../utils/logger");
const error = require("../../../errorResponse.json");

exports.validate = async (req, res) => {
  const { isVerified } = req.user;
  const { email } = req.emailToken;

  if (isVerified) {
    return res.status(409).send({
      message: error.api.emailVerify.emailAlreadyVerified,
      code: "EMAIL_VERIFIED",
    });
  }

  try {
    const verifyUser = await database
      .update({
        isVerified: true,
        updatedAt: new Date().toJSON(),
      })
      .from("users")
      .where({
        email,
      })
      .returning("isVerified");

    const isUserVerified = verifyUser[0];
    await database.delete().from("emailVerification").where({ email });

    res.status(200).send({
      verify: {
        success: isUserVerified,
      },
    });
  } catch (err) {
    logger.error(err);

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    })
  }
};
