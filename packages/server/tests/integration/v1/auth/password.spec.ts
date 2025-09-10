import { describe, expect, it } from "vitest";
import supertest from "supertest";
import { faker } from "@faker-js/faker";
import { v4 as uuid } from "uuid";

import app from "../../../../src/app";
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
    const user = {
      userId: uuid(),
      username: "reset-user1234",
      email: "resetuser12345@example.com",
      name: "Reset Test_1",
      password: "hashed-password",
      createdAt: new Date(),
    };

    await database("users").insert(user);

    const response = await supertest(app)
      .post("/api/v1/auth/password/reset")
      .send({ email: user.email });

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/json");
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
});
