import type {
  CreateUserOptions,
  GetOrCreateOpenIDConnectUserOptions,
  TCreatedUser,
} from "./types";
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
import {
  getUserByEmail,
  getUserById,
  type IInsertUserQuery,
  insertUser,
} from "../../repository/user";
import { DatabaseError } from "pg";
import { assignEveryoneRoleQuery } from "../../repository/roles";
import type {
  IAuthenticationTokenPayload,
  IVerifyEmailJwtPayload,
} from "../../types";
import { mailWorker } from "../../worker/handler/mail";
import { mailQueue } from "../../worker/tasks/mail";
import { sendAccountVerificationEmail } from "../mail/worker.service";
import { createToken } from "../token.service";
import {
  AuthenticationFailedError,
  FailedToCreateUser,
  UserExistsError,
  UsernameExistsError,
} from "./errors";
import logger from "../../utils/logger";
import type { IUserInfo } from "@logchimp/types";

export class AuthService {
  async CreateUser(email: string, options: CreateUserOptions) {
    // change email to lowercase to avoid case-sensitivity
    const userEmail = (email || "").trim().toLowerCase();

    const userId = uuidv4();
    const name = sanitiseName(options.user?.name);

    // get username from email address after truncating to first 30 characters and sanitising it
    const baseUsername = sanitiseUsername(userEmail.split("@")[0].slice(0, 30));

    // get avatar by MD5 hashing email
    const avatar =
      options?.user?.avatar ||
      `https://www.gravatar.com/avatar/${md5(userEmail)}`;

    // hash password
    let hashedPassword: string | null;
    if (options.user?.password) {
      hashedPassword = hashPassword(options.user.password);
    }

    if (await this.isEmailUniqueQuery(userEmail)) {
      throw new UserExistsError();
    }

    const newUser = await this.insertUserWithRetry({
      userId,
      name,
      username: _generateUniqueUsername(baseUsername),
      email: userEmail,
      hashedPassword,
      avatar,
    });

    await assignEveryoneRoleQuery(newUser.userId);

    try {
      if (options?.options?.sendAccountVerificationEmail) {
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
      }
    } catch (e) {
      logger.error({
        message: "Failed to send account verification email",
        error: e,
      });
    }

    return newUser;
  }

  async GetOrCreateOpenIDConnectUser({
    issuer,
    subject,
    name,
    email,
    emailVerified,
    picture,
  }: GetOrCreateOpenIDConnectUserOptions): Promise<IUserInfo> {
    const getUserIdentity = await database("auth_identities")
      .select<{ userId: string }>("user_id as userId")
      .where({ provider: issuer, subject })
      .first();

    if (getUserIdentity) {
      const user = await getUserById(database, getUserIdentity.userId);
      if (!user) {
        throw new AuthenticationFailedError();
      }
      return user;
    }

    // check if an existing email needs to be linked
    let user = await getUserByEmail(database, email);
    if (!user) {
      await this.CreateUser(email, {
        user: {
          name,
          avatar: picture,
        },
        options: {
          sendAccountVerificationEmail:
            typeof emailVerified === "boolean" ? emailVerified : true,
        },
      });

      user = await getUserByEmail(database, email);
    }

    await database
      .insert({
        id: uuidv4(),
        user_id: user.userId,
        provider: issuer,
        subject,
        email,
        email_verified: emailVerified,
      })
      .into("auth_identities");

    return user;
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

  generateUserAuthToken(userId: string, email: string) {
    return createToken(
      {
        userId,
        email,
      } satisfies IAuthenticationTokenPayload,
      {
        expiresIn: "2d",
      },
    );
  }
}
