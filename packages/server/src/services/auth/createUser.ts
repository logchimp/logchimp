// modules
import { v4 as uuidv4 } from "uuid";
import md5 from "md5";

// database
import database from "../../database";

// services
import { verifyEmail } from "./verifyEmail";
import { createToken } from "../token.service";

// utils
import { hashPassword } from "../../utils/password";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

/**
 * Add user to 'users' database table
 *
 * @param {any} req
 * @param {any} res
 * @param {any} _next
 * @param {object} userData - User data to create account
 * @param {string} userData.email - User email address
 * @param {string} userData.password - User password
 * @param {string} userData.name - User name
 * @returns {object|null} - Returning user data object from database or null
 */
const createUser = async (req, res, _next, userData) => {
  // generate user unique identification
  const userId = uuidv4(userData.email);

  const name = userData.name;

  // get username from email address
  const username = userData.email.split("@")[0];

  // get avatar by hashing email
  const userMd5Hash = md5(userData.email);
  const avatar = `https://www.gravatar.com/avatar/${userMd5Hash}`;

  // hash password
  const hashedPassword = hashPassword(userData.password);

  try {
    const {
      rows: [getUser],
    } = await database.raw(
      `
        SELECT EXISTS (
          SELECT * FROM users WHERE LOWER(email) = LOWER(:email)
        )
      `,
      {
        email: userData.email,
      },
    );

    const userExists = getUser.exists;
    if (userExists) {
      res.status(409).send({
        message: error.middleware.user.userExists,
        code: "USER_EXISTS",
      });
      return null;
    }

    // insert user to database
    const [newUser] = await database
      .insert({
        userId,
        name,
        username,
        email: userData.email,
        password: hashedPassword,
        avatar,
      })
      .into("users")
      .returning(["userId", "name", "username", "email", "avatar"]);

    if (!newUser) {
      return null;
    }

    // assign '@everyone' role
    const getRole = await database
      .select()
      .from("roles")
      .where({
        name: "@everyone",
      })
      .first();

    await database
      .insert({
        id: uuidv4(),
        role_id: getRole.id,
        user_id: newUser.userId,
      })
      .into("roles_users");

    const tokenPayload = {
      userId: newUser.userId,
      email: newUser.email,
      type: "emailVerification",
    };
    // send email verification
    const url = req.headers.origin;
    await verifyEmail(url, tokenPayload);

    // create auth token
    const authToken = createToken(tokenPayload, {
      expiresIn: "2d",
    });

    return {
      authToken,
      ...newUser,
    };
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });

    return res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
};

export { createUser };
