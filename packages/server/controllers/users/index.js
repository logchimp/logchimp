const filter = require("./filter");
const getProfile = require("./getProfile");
const updateProfile = require("./updateProfile");
const accessDashboard = require("./accessDashboard");
const getUserPermissions = require("./getUserPermissions");
const getUserInfo = require("./getUserInfo");
const updateUserInfo = require("./updateUserInfo");

module.exports = {
  ...filter,
  getProfile,
  updateProfile,
  ...accessDashboard,
  getUserPermissions,
  getUserInfo,
  updateUserInfo,
};
