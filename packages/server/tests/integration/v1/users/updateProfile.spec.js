import { describe, it, expect } from "vitest";
const supertest = require("supertest");

const app = require("../../../../app");
const database = require("../../../../database");
const { createToken } = require("../../../../services/token.service");
import { user as generateUser } from "../../../utils/generators";

describe("PATCH /api/v1/users/profile", () => {
  it("should throw INVALID_AUTH_HEADER ", async () => {
    const response = await supertest(app)
      .patch("/api/v1/users/profile")
      .send({ name: "New Name" });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw INVALID_AUTH_HEADER_FORMAT when Authorization header is malformed", async () => {
    const response = await supertest(app)
      .patch("/api/v1/users/profile")
      .set("Authorization", "WrongFormatTokenHere");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER_FORMAT");
  });

  it("should throw error NAME_LENGTH if name exceeds 30 characters", async () => {
    const user = generateUser();
    user.isBlocked = false;
    user.isOwner = true;

    await database("users").insert(user);
    const token = createToken({ userId: user.userId }, { expiresIn: "1h" });

    const response = await supertest(app)
      .patch("/api/v1/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "a".repeat(31) });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("NAME_LENGTH");

    await database("users").where({ userId: user.userId }).del();
  });

  it("should update user's profile name", async () => {
    const user = generateUser();
    user.isBlocked = false;
    user.isOwner = true;

    await database("users").insert(user);
    const token = createToken({ userId: user.userId }, { expiresIn: "1h" });

    const newName = "Updated Name";

    const response = await supertest(app)
      .patch("/api/v1/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: newName });

    expect(response.status).toBe(200);
    expect(response.body.user).toBe(user);
    const dbUser = await database("users")
      .where({ userId: user.userId })
      .first();

    expect(dbUser.name).toBe(newName);

    await database("users").where({ userId: user.userId }).del();
  });

  it("should throw INVALID_TOKEN for tampered token", async () => {
    const validToken = createToken({ userId: "abc" });
    const tamperedToken = validToken.replace(/\w$/, "x");

    const response = await supertest(app)
      .patch("/api/v1/users/profile")
      .set("Authorization", `Bearer ${tamperedToken}`)
      .send({ name: "Name" });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_TOKEN");
  });

  it("should throw INVALID_JWT", async () => {
    const response = await supertest(app)
      .patch("/api/v1/users/profile")
      .set("Authorization", "Bearer invalid.jwt.token")
      .send({ name: "Name" });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_JWT");
  });

  it("should throw USER_NOT_FOUND if user does not exist", async () => {
    const fakeToken = createToken(
      { userId: "nonexistent-user-id" },
      { expiresIn: "1h" }
    );

    const response = await supertest(app)
      .patch("/api/v1/users/profile")
      .set("Authorization", `Bearer ${fakeToken}`)
      .send({ name: "Name" });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("USER_NOT_FOUND");
  });

  it("should throw error USER_BLOCK", async () => {
    const response = await supertest(app).post("/api/v1/auth/login").send({
      email: "user_blocked@example.com",
      password: "strongPassword",
    });

    expect(response.statusCode).toEqual(403);
    expect(response.body.code).toEqual("USER_BLOCKED");
  });

  it("should throw error ACCESS_DENIED", async () => {
    const user = generateUser();
    user.isBlocked = false;
    user.isOwner = false;

    await database("users").insert(user);
    const token = createToken({ userId: user.userId }, { expiresIn: "1h" });

    const response = await supertest(app)
      .patch("/api/v1/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Name" });

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("ACCESS_DENIED");

    await database("users").where({ userId: user.userId }).del();
  });

  it("should throw AUTHORIZATION_FAILED if no userId is set", async () => {
    const token = createToken({}, { expiresIn: "1h" });

    const response = await supertest(app)
      .patch("/api/v1/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Name" });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("AUTHORIZATION_FAILED");
  });
});
