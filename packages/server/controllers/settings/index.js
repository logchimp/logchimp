const siteSettings = require("./siteSettings");
const update = require("./update");
const updateLogo = require("./updateLogo");
const getLabs = require("./getLabs");
const updateLabs = require("./updateLabs");

module.exports = {
  ...siteSettings,
  ...update,
  ...updateLogo,
  ...getLabs,
  ...updateLabs,
};
