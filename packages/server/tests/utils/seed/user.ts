import { v4 as uuid } from "uuid";
import { faker } from "@faker-js/faker";
import supertest from "supertest";

import app from "../../../src/app";
import database from "../../../src/database";
import { hashPassword } from "../../../src/utils/password";

interface CreateUserArgs {
  name: string;
  email: string;
  username: string;
  password: string;
  isVerified: boolean;
  isOwner: boolean;
  isBlocked: boolean;
}

/**
 * NOTE: this function by-passes 'allowSignup' settings
 * Should have `@everyone` role assigned.
 *
 * @param {object={}} user
 */
export async function createUser(
  user?: Partial<CreateUserArgs>,
): Promise<void> {
  const userId = uuid();
  const name = user?.name;
  const email = (user?.email || faker.internet.email()).toLowerCase();
  const username = user?.username ? user.username : email.split("@")[0];
  const password = user?.password || "password";
  const isVerified = user?.isVerified || false;
  const isOwner = user?.isOwner || false;
  const isBlocked = user?.isBlocked || false;

  // manually seeding data due to 'allowSignup' possibly be disabled
  await database
    .insert({
      userId,
      name,
      email,
      password: hashPassword(password),
      username,
      isVerified,
      isOwner,
      isBlocked,
    })
    .into("users");

  // assign '@everyone' role to user
  await database.raw(
    `
        INSERT INTO roles_users (id, role_id, user_id)
        VALUES (:uuid, (SELECT id
                        FROM roles
                        WHERE name = '@everyone'), :userId)
    `,
    {
      uuid: uuid(),
      userId,
    },
  );

  const response = await supertest(app).post("/api/v1/auth/login").send({
    email,
    password,
  });

  return response.body;
}
