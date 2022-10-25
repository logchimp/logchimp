const reset = require("./reset");
const validateToken = require("./validateToken");
const set = require("./set");

module.exports = {
  ...reset,
  ...validateToken,
  ...set,
};
