import { describe, it, expect } from "vitest";
import supertest from "supertest";
import { v4 as uuidv4 } from "uuid";

import app from "../../../../src/app";
import database from "../../../../src/database";
import { createToken } from "../../../../src/services/token.service";
import { user as generateUser } from "../../../utils/generators";
import { createUser } from "../../../utils/seed/user";

describe("GET /api/v1/users/profile", () => {
  it("should throw INVALID_AUTH_HEADER", async () => {
    const response = await supertest(app).get("/api/v1/users/profile");

    expect(response.statusCode).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw INVALID_AUTH_HEADER_FORMAT", async () => {
    const response = await supertest(app)
      .get("/api/v1/users/profile")
      .set("Authorization", "WrongFormatTokenHere");

    expect(response.statusCode).toBe(401);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER_FORMAT");
  });

  it("should throw INVALID_JWT", async () => {
    const response = await supertest(app)
      .get("/api/v1/users/profile")
      .set("Authorization", "Bearer InvalidJWTToken");

    expect(response.statusCode).toBe(401);
    expect(response.body.code).toBe("INVALID_JWT");
  });

  it("should throw INVALID_TOKEN", async () => {
    const fakeToken = createToken({}, {});

    const response = await supertest(app)
      .get("/api/v1/users/profile")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(response.statusCode).toBe(500);
    expect(response.body.code).toBe("SERVER_ERROR");
  });

  it("should throw INVALID_TOKEN", async () => {
    const nonExistentUserId = uuidv4();
    const fakeToken = createToken(
      { userId: nonExistentUserId },
      { expiresIn: "1h" },
    );

    const response = await supertest(app)
      .get("/api/v1/users/profile")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.code).toBe("USER_NOT_FOUND");
  });

  it("should throw USER_BLOCK", async () => {
    const user = generateUser();
    user.isBlocked = true;
    user.isOwner = false;

    await database("users").insert(user);
    const token = createToken({ userId: user.userId }, { expiresIn: "1h" });

    const response = await supertest(app)
      .get("/api/v1/users/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("USER_BLOCK");
  });

  it("should throw ACCESS_DENIED", async () => {
    const user = generateUser();
    user.isBlocked = false;
    user.isOwner = false;

    await database("users").insert(user);
    const token = createToken({ userId: user.userId }, { expiresIn: "1h" });

    const response = await supertest(app)
      .get("/api/v1/users/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("ACCESS_DENIED");
  });

  it("should get user profile", async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .get("/api/v1/users/profile")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.user.name).toBeNull();
    expect(response.body.user.userId).toBe(user.userId);
    expect(response.body.user.username).toBe(user.username);
  });
});
