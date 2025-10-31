import type { Request, Response, NextFunction } from "express";
import type { IAuthUser, TAuthSignupRequestBody } from "@logchimp/types";
import { v4 as uuidv4 } from "uuid";
import md5 from "md5";

// database
import database from "../../database";

// services
import { verifyEmail } from "./verifyEmail";
import { createToken } from "../token.service";

// utils
import {
  generateNanoID as nanoid,
  sanitiseUsername,
  sanitiseName,
} from "../../helpers";
import { hashPassword } from "../../utils/password";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import type { IVerifyEmailJwtPayload } from "../../types";

interface UserData {
  email: string;
  password: string;
  name?: string | null;
}

/**
 * Add user to 'users' database table
 *
 * @param {Request} _
 * @param {Response} res
 * @param {NextFunction} _next
 * @param {object} userData - User data to create account
 * @param {string} userData.email - User email address
 * @param {string} userData.password - User password
 * @param {string} userData.name - User name
 * @returns {object|null} - Returning user data object from database or null
 */
const createUser = async (
  _: Request<unknown, unknown, TAuthSignupRequestBody>,
  res: Response,
  _next: NextFunction,
  userData: UserData,
): Promise<IAuthUser | null> => {
  // change email to lowercase to avoid case-sensitivity
  const email = userData.email.toLowerCase();

  // generate user unique identification
  const userId = uuidv4();

  // sanitise the name
  const name = sanitiseName(userData.name);

  // get username from email address after truncating to first 30 characters and sanitise
  const baseUsername = sanitiseUsername(
    userData.email.split("@")[0].slice(0, 30),
  );

  // get avatar by hashing email
  const userMd5Hash = md5(email);
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
        email,
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

    const username = generateUniqueUsername(baseUsername);

    // insert user to database
    const [newUser] = await database
      .insert({
        userId,
        name,
        username,
        email,
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

    const tokenPayload: IVerifyEmailJwtPayload = {
      userId: newUser.userId,
      email: newUser.email,
      type: "emailVerification",
    };
    // send email verification
    await verifyEmail(tokenPayload);

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

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
    return null;
  }
};

export { createUser };

function generateUniqueUsername(baseUsername: string): string {
  let username = baseUsername;

  const suffix = nanoid(8);
  username = `${baseUsername}-${suffix}`.slice(0, 30);

  return username;
}
