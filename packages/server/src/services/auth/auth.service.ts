import type { CreateUserOptions, TCreatedUser } from "./types";
import {
  generateUniqueUsername as _generateUniqueUsername,
  sanitiseName,
  sanitiseUsername,
} from "../../helpers";
import md5 from "md5";
import { v4 as uuidv4 } from "uuid";
import { hashPassword } from "../../utils/password";
import database from "../../database";
import { SIGNUP_USERNAME_MAX_ATTEMPTS } from "../../constants";
import { type IInsertUserQuery, insertUser } from "../../repository/user";
import { DatabaseError } from "pg";
import { assignEveryoneRoleQuery } from "../../repository/roles";
import type { IVerifyEmailJwtPayload } from "../../types";
import { mailWorker } from "../../worker/handler/mail";
import { mailQueue } from "../../worker/tasks/mail";
import { sendAccountVerificationEmail } from "../mail/worker.service";
import { createToken } from "../token.service";
import {
  FailedToCreateUser,
  UserExistsError,
  UsernameExistsError,
} from "./errors";

export class AuthService {
  async CreateUser(email: string, options: CreateUserOptions) {
    // change email to lowercase to avoid case-sensitivity
    const userEmail = (email || "").trim().toLowerCase();

    const userId = uuidv4();
    const name = sanitiseName(options.name);

    // get username from email address after truncating to first 30 characters and sanitising it
    const baseUsername = sanitiseUsername(userEmail.split("@")[0].slice(0, 30));

    // get avatar by MD5 hashing email
    const avatar = `https://www.gravatar.com/avatar/${md5(userEmail)}`;

    // hash password
    let hashedPassword: string | null;
    if (options.password) {
      hashedPassword = hashPassword(options.password);
    }

    if (await this.isEmailUniqueQuery(email)) {
      throw new UserExistsError();
    }

    const newUser = await this.insertUserWithRetry({
      userId,
      name,
      username: _generateUniqueUsername(baseUsername),
      email,
      hashedPassword,
      avatar,
    });

    await assignEveryoneRoleQuery(newUser.userId);

    const tokenPayload: IVerifyEmailJwtPayload = {
      userId: newUser.userId,
      email: newUser.email,
      type: "emailVerification",
    };

    if (mailWorker.isRunning) {
      await mailQueue.sendAccountVerificationEmail(tokenPayload);
    } else {
      await sendAccountVerificationEmail(tokenPayload);
    }

    // create auth token
    const authToken = createToken(tokenPayload, {
      expiresIn: "2d",
    });

    return {
      authToken,
      ...newUser,
    };
  }

  private async isEmailUniqueQuery(email: string): Promise<boolean> {
    const result = await database("users")
      .where(database.raw("LOWER(email) = LOWER(?)", [email]))
      .first<{ userId: string }>("userId");
    return !!result?.userId;
  }

  /**
   * Attempts to insert the user, regenerating the username and retrying on
   * a username collision, up to SIGNUP_USERNAME_MAX_ATTEMPTS times.
   */
  private async insertUserWithRetry(
    base: IInsertUserQuery,
    attempt = 0,
  ): Promise<TCreatedUser> {
    if (attempt >= SIGNUP_USERNAME_MAX_ATTEMPTS) {
      throw new UsernameExistsError();
    }

    const username =
      attempt === 0 ? base.username : _generateUniqueUsername(base.username);

    try {
      const newUsers = await insertUser(database, { ...base, username });
      if (newUsers.length === 0) {
        throw new FailedToCreateUser();
      }

      return newUsers[0];
    } catch (err) {
      if (err instanceof DatabaseError) {
        if (err.constraint === "users_email_unique") {
          throw new UserExistsError();
        }
        if (err.constraint === "users_username_unique") {
          return this.insertUserWithRetry(base, attempt + 1);
        }
      }
      throw err;
    }
  }
}
