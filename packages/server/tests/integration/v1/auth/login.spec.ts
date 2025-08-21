import { describe, expect, it } from "vitest";
import supertest from "supertest";
import { v4 as uuid } from "uuid";
import { faker } from "@faker-js/faker";

import app from "../../../../src/app";
import { verifyToken } from "../../../../src/services/token.service";
import { createUser } from "../../../utils/seed/user";
import database from "../../../../src/database";
import { hashPassword } from "../../../../src/utils/password";

describe("POST /api/v1/auth/login", () => {
  it('should throw error "EMAIL_INVALID"', async () => {
    const response = await supertest(app).post("/api/v1/auth/login");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("EMAIL_INVALID");
  });

  it('should throw error "USER_NOT_FOUND"', async () => {
    const response = await supertest(app).post("/api/v1/auth/login").send({
      email: "user_not_found@example.com",
    });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("USER_NOT_FOUND");
  });

  it('should throw error "PASSWORD_MISSING"', async () => {
    const { user } = await createUser();
    const response = await supertest(app).post("/api/v1/auth/login").send({
      email: user.email,
      password: "",
    });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("PASSWORD_MISSING");
  });

  it('should throw error "INCORRECT_PASSWORD"', async () => {
    const { user } = await createUser();
    const response = await supertest(app).post("/api/v1/auth/login").send({
      email: user.email,
      password: "incorrect_password",
    });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("INCORRECT_PASSWORD");
  });

  it("should get login the user with credentials", async () => {
    const { user: u } = await createUser();
    const response = await supertest(app).post("/api/v1/auth/login").send({
      email: u.email,
      password: "password",
    });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);

    const user = response.body.user;
    const token = verifyToken(user.authToken);

    // check auth token
    expect(token.email).toEqual(u.email);
    expect(token.userId).toEqual(user.userId);

    expect(user.email).toEqual(u.email);
    expect(user.username).toEqual(u.username);
    expect(user.avatar).toBeNull();
    expect(user.name).toBeNull();
    expect(user.password).toBeUndefined();
  });

  it('should throw error "USER_BLOCKED"', async () => {
    const userId = uuid();
    const email = faker.internet.email().toLowerCase();
    const username = email.split("@")[0];

    await database
      .insert({
        userId,
        email,
        password: hashPassword("password"),
        username,
        isVerified: false,
        isBlocked: true,
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
      password: "password",
    });

    // expect(response.statusCode).toEqual(403);
    expect(response.body.code).toEqual("USER_BLOCKED");
  });
});
