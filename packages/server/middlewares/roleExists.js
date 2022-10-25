const database = require("../database");

// utils
const error = require("../errorResponse.json");

module.exports = async (req, res, next) => {
  const id = req.body.id || req.params.id;

  const role = await database
    .select()
    .from("roles")
    .where({
      id: id || null,
    })
    .first();

  if (!role) {
    return res.status(404).send({
      message: error.api.roles.roleNotFound,
      code: "ROLE_NOT_FOUND",
    });
  }

  req.role = role;
  next();
};
