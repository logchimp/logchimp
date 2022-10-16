const verify = require("./verify");
const validate = require("./validate");

module.exports = {
  ...verify,
  ...validate,
};
