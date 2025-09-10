import { describe, expect, it } from "vitest";
import supertest from "supertest";
import { faker } from "@faker-js/faker";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";

import app from "../../../../src/app";
import { createToken } from "../../../../src/services/token.service";
import database from "../../../../src/database";
import { createUser } from "../../../utils/seed/user";
import { createToken } from "../../../../src/services/token.service";
import database from "../../../../src/database";

describe("POST /api/v1/auth/password/reset", () => {
  it('should throw error "EMAIL_INVALID" when invalid email is sent', async () => {
    const response = await supertest(app)
      .post("/api/v1/auth/password/reset")
      .send({ email: "not-an-email" });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("EMAIL_INVALID");
  });

  it('should throw error "USER_NOT_FOUND" when email does not exist', async () => {
    const response = await supertest(app)
      .post("/api/v1/auth/password/reset")
      .send({ email: faker.internet.email() });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("USER_NOT_FOUND");
  });
});

describe("POST /api/v1/auth/password/validateToken", () => {
  it("should throw error MISSING_TOKEN if token is missing", async () => {
    const response = await supertest(app).post(
      "/api/v1/auth/password/validateToken",
    );

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.errors[0].code).toBe("MISSING_TOKEN");
  });

  it("should throw error INVALID_TOKEN", async () => {
    // generate token
    const tokenPayload = {
      userId: "601db0cd-ba5b-480d-a62b-06c8dcb72267",
      email: "mittalyashu77@gmail.com",
      type: "emailVerification",
    };

    const token = createToken(tokenPayload, {
      expiresIn: "2h",
    });

    const response = await supertest(app)
      .post("/api/v1/auth/password/validateToken")
      .send({
        token,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("INVALID_TOKEN");
  });

  it("should return 200 and reset.valid = true for a valid token", async () => {
    const user = {
      userId: uuid(),
      username: "valid-user-200",
      email: "valid-user-200@example.com",
      name: "Test User",
      password: "hashed-password",
      createdAt: new Date(),
    };
    await database("users").insert(user);

    const secretKey = process.env.LOGCHIMP_SECRET_KEY || "test_secret";
    const payload = { email: user.email, type: "resetPassword" };
    const token = jwt.sign(payload, secretKey, { expiresIn: "15m" });

    await database("resetPassword").insert({
      email: user.email,
      token,
      createdAt: new Date(),
    });

    const response = await supertest(app)
      .post("/api/v1/auth/password/validateToken")
      .send({ token });

    expect(response.status).toBe(200);
    expect(response.body.reset.valid).toBe(true);
    expect(response.body.reset.email).toBe(user.email);
    expect(response.body.reset.token).toBe(token);
  });
});

describe("POST /api/v1/password/set", () => {
  it("should throw error MISSING_TOKEN if token is missing", async () => {
    const response = await supertest(app).post(
      "/api/v1/auth/password/validateToken",
    );

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.errors[0].code).toBe("MISSING_TOKEN");
  });

  it("should throw error INVALID_TOKEN", async () => {
    // generate token
    const tokenPayload = {
      userId: "601db0cd-ba5b-480d-a62b-06c8dcb72267",
      email: "mittalyashu77@gmail.com",
      type: "emailVerification",
    };

    const token = createToken(tokenPayload, {
      expiresIn: "2h",
    });

    const response = await supertest(app)
      .post("/api/v1/auth/password/validateToken")
      .send({
        token,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("INVALID_TOKEN");
  });

  it("should successfully reset password and return 200", async () => {
    const [user] = await database("users")
      .insert({
        userId: uuid(),
        email: "set_success@example.com",
        username: "set_success",
        password: "old_password_hash",
      })
      .returning("*");

    const secret = process.env.LOGCHIMP_SECRET_KEY || "test_secret";
    const token = jwt.sign(
      { email: user.email, type: "resetPassword" },
      secret,
      { expiresIn: "15m" },
    );

    await database("resetPassword").insert({
      email: user.email,
      token,
      createdAt: new Date(),
    });

    const response = await supertest(app)
      .post("/api/v1/auth/password/set")
      .send({
        token,
        password: "newStrongPassword123",
      });

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.body).toEqual({
      reset: { success: true },
    });
  });
});
