import type { NextFunction, Request, Response } from "express";
import type { IAuthUser, TAuthSignupRequestBody } from "@logchimp/types";
import { v4 as uuidv4 } from "uuid";
import md5 from "md5";
import { DatabaseError } from "pg";

import { verifyEmail } from "./verifyEmail";
import { createToken } from "../token.service";
import database from "../../database";
import {
  generateNanoID as nanoid,
  sanitiseName,
  sanitiseUsername,
} from "../../helpers";
import { hashPassword } from "../../utils/password";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import type { IVerifyEmailJwtPayload } from "../../types";
import { SIGNUP_USERNAME_MAX_ATTEMPTS } from "../../constants";

interface UserData {
  email: string;
  password: string;
  name?: string | null;
}

type TCreatedUser = Omit<IAuthUser, "authToken">;

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

  const userId = uuidv4();
  const name = sanitiseName(userData.name);

  // get username from email address after truncating to first 30 characters and sanitising it
  const baseUsername = sanitiseUsername(
    userData.email.split("@")[0].slice(0, 30),
  );

  // get avatar by MD5 hashing email
  const avatar = `https://www.gravatar.com/avatar/${md5(email)}`;

  // hash password
  const hashedPassword = hashPassword(userData.password);

  try {
    if (await _isEmailUniqueQuery(email)) {
      res.status(409).send({
        message: error.middleware.user.userExists,
        code: "USER_EXISTS",
      });
      return null;
    }
  } catch (e) {
    logger.error({
      message: "Email exists",
      error: e,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
    return null;
  }

  let usernameAttempts = 0;
  let newUser: TCreatedUser | null;

  async function insertUser() {
    if (usernameAttempts >= SIGNUP_USERNAME_MAX_ATTEMPTS) {
      res.status(409).send({
        message: error.api.authentication.usernameExists,
        code: "USERNAME_EXISTS",
      });
      return null;
    }

    try {
      newUser = await _insertUserQuery({
        userId,
        name,
        username: _generateUniqueUsername(baseUsername),
        email,
        hashedPassword,
        avatar,
      });
    } catch (err) {
      if (err instanceof DatabaseError) {
        if (err.constraint === "users_email_unique") {
          res.status(409).send({
            message: error.middleware.user.userExists,
            code: "USER_EXISTS",
          });
          return null;
        }

        if (err.constraint === "users_username_unique") {
          usernameAttempts++;
          return await insertUser();
        }
      }

      res.status(500).send({
        message: error.general.serverError,
        code: "SERVER_ERROR",
      });
      return null;
    }
  }

  await insertUser();

  if (!newUser) {
    return null;
  }

  try {
    await _assignEveryoneRoleQuery(newUser.userId);

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
    logger.error({
      message: "Failed to create user and assign role",
      error: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
    return null;
  }
};

async function _isEmailUniqueQuery(email: string): Promise<boolean> {
  const result = await database("users")
    .where(database.raw("LOWER(email) = LOWER(?)", [email]))
    .first<{ userId: string }>("userId");
  return !!result?.userId;
}

interface IInsertUserQuery {
  userId: string;
  name: string;
  username: string;
  email: string;
  hashedPassword: string;
  avatar: string;
}

async function _insertUserQuery({
  name,
  email,
  hashedPassword,
  avatar,
  username,
  userId,
}: IInsertUserQuery): Promise<TCreatedUser> {
  try {
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
      .returning<Array<TCreatedUser>>([
        "userId",
        "name",
        "username",
        "email",
        "avatar",
      ]);

    return newUser;
  } catch (err) {
    logger.error({
      message: "failed to insert user into database",
      error: err,
    });

    throw err;
  }
}

// assign '@everyone' role
async function _assignEveryoneRoleQuery(userId: string) {
  const getRole = await database
    .select<{ id: string }>("id")
    .from("roles")
    .where({
      name: "@everyone",
    })
    .first();

  await database
    .insert({
      id: uuidv4(),
      role_id: getRole.id,
      user_id: userId,
    })
    .into("roles_users");
}

function _generateUniqueUsername(baseUsername: string): string {
  const trimmedBase =
    baseUsername.length >= 22 ? baseUsername.slice(0, 21) : baseUsername;
  return `${trimmedBase}_${nanoid(8)}`;
}

export { createUser };
