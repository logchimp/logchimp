import { describe, expect, it } from "vitest";
import supertest from "supertest";
import { faker } from "@faker-js/faker";

import app from "../../../../src/app";
import { createToken } from "../../../../src/services/token.service";
import { createUser } from "../../../utils/seed/user";
import database from "../../../../src/database";

async function resetPassword() {
  const { user } = await createUser();

  const tokenPayload = { email: user.email, type: "resetPassword" };
  const token = createToken(tokenPayload, {
    expiresIn: "2h",
  });

  await database("resetPassword").insert({
    email: user.email,
    token,
    createdAt: new Date(),
  });

  return { user, token };
}

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
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.body).toHaveProperty("reset.__token.token");
    expect(typeof response.body.reset.__token.token).toBe("string");
  });
});

describe("POST /api/v1/auth/password/validateToken", () => {
  it("should throw error 'MISSING_TOKEN' if token is missing", async () => {
    const response = await supertest(app).post(
      "/api/v1/auth/password/validateToken",
    );

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "MISSING_TOKEN" }),
      ]),
    );
  });

  it("should throw error 'INVALID_TOKEN'", async () => {
    // generate token
    const tokenPayload = {
      userId: faker.string.uuid(),
      email: faker.internet.email().toLowerCase(),
      type: "resetPassword",
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
    const { user, token } = await resetPassword();

    const response = await supertest(app)
      .post("/api/v1/auth/password/validateToken")
      .send({ token });

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.body.reset.valid).toBe(true);
    expect(response.body.reset.email).toBe(user.email);
  });
});

describe("POST /api/v1/password/set", () => {
  it("should throw error 'MISSING_TOKEN' if token is missing", async () => {
    const response = await supertest(app).post(
      "/api/v1/auth/password/validateToken",
    );

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "MISSING_TOKEN" }),
      ]),
    );
  });

  it("should throw error 'INVALID_TOKEN'", async () => {
    const tokenPayload = {
      userId: faker.string.uuid(),
      email: faker.internet.email().toLowerCase(),
      type: "resetPassword",
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

  it("should throw 'PASSWORD_MISSING' on empty password", async () => {
    const { token } = await resetPassword();

    const response = await supertest(app)
      .post("/api/v1/auth/password/set")
      .send({
        token,
        password: "",
      });

    expect(response.status).toBe(400);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "PASSWORD_MISSING" }),
      ]),
    );
  });

  it("should successfully reset password and return 200", async () => {
    const { user, token } = await resetPassword();

    const newPassword = "newStrongPassword123";

    const response = await supertest(app)
      .post("/api/v1/auth/password/set")
      .send({
        token,
        password: newPassword,
      });

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.body).toEqual({
      reset: { success: true },
    });

    const loginResponse = await supertest(app).post("/api/v1/auth/login").send({
      email: user.email,
      password: newPassword,
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.headers["content-type"]).toContain("application/json");
  });

  it("should only reset password from the request originating email", async () => {
    const { user: user2 } = await createUser();
    const { user: user1, token } = await resetPassword();
    const newPassword = "newPassword";

    const response = await supertest(app)
      .post("/api/v1/auth/password/set")
      .send({
        token,
        email: user2.email,
        password: newPassword,
      });

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.body).toEqual({
      reset: { success: true },
    });

    const user1LoginResponse = await supertest(app)
      .post("/api/v1/auth/login")
      .send({
        email: user1.email,
        password: newPassword,
      });
    expect(user1LoginResponse.status).toBe(200);
    expect(user1LoginResponse.headers["content-type"]).toContain(
      "application/json",
    );

    const user2LoginResponse = await supertest(app)
      .post("/api/v1/auth/login")
      .send({
        email: user2.email,
        password: "password",
      });
    expect(user2LoginResponse.status).toBe(200);
    expect(user2LoginResponse.headers["content-type"]).toContain(
      "application/json",
    );
  });
});
