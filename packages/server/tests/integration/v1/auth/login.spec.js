import { describe, it, expect } from "vitest";
const supertest = require("supertest");

const app = require("../../../../app");
const { verifyToken } = require("../../../../services/token.service");

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
    const response = await supertest(app).post("/api/v1/auth/login").send({
      email: "user_exists@example.com",
      password: "",
    });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("PASSWORD_MISSING");
  });

  it('should throw error "INCORRECT_PASSWORD"', async () => {
    const response = await supertest(app).post("/api/v1/auth/login").send({
      email: "user_exists@example.com",
      password: "incorrect_password",
    });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("INCORRECT_PASSWORD");
  });

  it('should get "user_exists" user', async () => {
    const response = await supertest(app).post("/api/v1/auth/login").send({
      email: "user_exists@example.com",
      password: "strongPassword",
    });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);

    const user = response.body.user;
    const token = verifyToken(user.authToken);

    // check auth token
    expect(token.email).toEqual("user_exists@example.com");
    expect(token.userId).toEqual(user.userId);

    expect(user.email).toEqual("user_exists@example.com");
    expect(user.username).toEqual("user_exists");
    expect(user.avatar).toBeNull();
    expect(user.name).toBeNull();
    expect(user.password).toBeUndefined();
  });

  it('should throw error "USER_BLOCKED"', async () => {
    const response = await supertest(app).post("/api/v1/auth/login").send({
      email: "user_blocked@example.com",
      password: "strongPassword",
    });

    expect(response.statusCode).toEqual(403);
    expect(response.body.code).toEqual("USER_BLOCKED");
  });
});
