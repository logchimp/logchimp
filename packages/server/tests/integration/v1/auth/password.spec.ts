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

  it("should send password reset mail and return token (200)", async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .post("/api/v1/auth/password/reset")
      .send({ email: user.email });

    expect(response.status).toBe(200);
    expect(response.body.reset.success).toBe(true);
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

  it("41. should validate token successfully in production", async () => {
    const tokenPayload = {
      userId: "601db0cd-as5b-480d-a62b-06c8dcb72267",
      email: "test12@example.com",
      type: "resetPassword",
      createdAt: new Date().toISOString(),
    };
    const token = createToken(tokenPayload, { expiresIn: "2h" });

    const response = await supertest(app)
      .post("/api/v1/auth/password/validateToken")
      .send({ token });

    expect(response.status).toBe(200);
    expect(response.body.reset.valid).toBe(true);
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

  it("should return 400 when password is missing", async () => {
    const secretKey = process.env.LOGCHIMP_SECRET_KEY || "secret";
    const tokenPayload = {
      userId: "601db0cd-as5b-480d-a62b-06c8dcb72267",
      email: "test12@example.com",
      type: "resetPassword",
      createdAt: new Date().toISOString(),
    };
    const token = createToken(tokenPayload, { expiresIn: "2h" });

    const response = await supertest(app)
      .post("/api/v1/auth/password/set")
      .send({ token });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("PASSWORD_MISSING");
  });

  it("should return 200 and update password when valid token + password provided", async () => {
    const userId = uuid();
    const email = "valid-user@example.com";
    const secretKey = process.env.LOGCHIMP_SECRET_KEY || "secret";

    // Insert user
    await database("users").insert({
      userId,
      username: "test-user",
      email,
      name: "Test User",
      password: "old-password",
      createdAt: new Date(),
    });

    // Create token
    const token = jwt.sign(
      { email, type: "resetPassword", userId },
      secretKey,
      {
        expiresIn: "15m",
      },
    );

    await database("resetPassword").insert({
      email,
      token,
      createdAt: new Date(),
    });

    const response = await supertest(app)
      .post("/api/v1/auth/password/set")
      .send({ token, password: "newPassword123" });

    expect(response.status).toBe(200);
    expect(response.body.reset.success).toBe(true);

    // Verify password changed
    const user = await database("users").where({ email }).first();
    expect(user.password).not.toBe("old-password");

    // Verify resetPassword cleared
    const resetEntry = await database("resetPassword").where({ email }).first();
    expect(resetEntry).toBeUndefined();
  });
});
