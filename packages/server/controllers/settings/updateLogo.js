// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.updateLogo = async (req, res) => {
  const host = req.headers.host;
  const imagePath = req.file.path.split("content/images")[1];

  const imageUrl = `//${host}/content/images${imagePath}`;

  try {
    const updatedSettings = await database
      .update({
        logo: imageUrl,
      })
      .from("settings")
      .returning("*");

    res.status(200).send({
      settings: updatedSettings[0],
    });
  } catch (err) {
    logger.error({
      code: "DASHBOARD_SETTINGS_UPDATE",
      message: "Update logo",
      err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    })
  }
};
