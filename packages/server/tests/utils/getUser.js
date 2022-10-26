const supertest = require("supertest");
const app = require("../../app");

/**
 * Login to user's account
 *
 * @param {string} email user email address
 * @param {string} password user password
 */
const getUser = async ({ email, password }) =>
  await supertest(app).post("/api/v1/auth/login").send({
    email,
    password,
  });

module.exports = {
  getUser,
};
