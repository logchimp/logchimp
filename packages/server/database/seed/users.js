const { v4: uuidv4 } = require("uuid");

const { hashPassword } = require("../../helpers");

module.exports = [
  {
    userId: uuidv4(),
    email: "user_exists@example.com",
    password: hashPassword("strongPassword"),
    username: "user_exists",
  },
  {
    userId: uuidv4(),
    email: "user_blocked@example.com",
    password: hashPassword("strongPassword"),
    username: "user_blocked",
    isBlocked: true,
  },
];
