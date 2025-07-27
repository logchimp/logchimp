import { describe, it, expect } from "vitest";
const supertest = require("supertest");
const { v4: uuidv4 } = require("uuid");
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
    expect(response.body.user).toMatchObject({
      userId: user.userId,
      name: newName,
      email: user.email,
      username: user.username,
    });

    const dbUser = await database("users")
      .where({ userId: user.userId })
      .first();

    expect(dbUser.name).toBe(newName);

    await database("users").where({ userId: user.userId }).del();
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
    const nonExistentUserId = uuidv4();
    const token = createToken(
      { userId: nonExistentUserId },
      { expiresIn: "1h" }
    );

    const response = await supertest(app)
      .patch("/api/v1/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Name" });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("USER_NOT_FOUND");
  });

  it("should throw error USER_BLOCK", async () => {
    const user = generateUser();
    user.isBlocked = true;
    user.isOwner = true;

    await database("users").insert(user);
    const token = createToken({ userId: user.userId }, { expiresIn: "1h" });

    const response = await supertest(app)
      .patch("/api/v1/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "new Name" });

    expect(response.statusCode).toEqual(403);
    expect(response.body.code).toEqual("USER_BLOCK");
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
});
