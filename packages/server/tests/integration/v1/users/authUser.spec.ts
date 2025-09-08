import { describe, expect, it } from "vitest";
import supertest from "supertest";
import { v4 as uuid } from "uuid";

import app from "../../../../src/app";
import { createUser } from "../../../utils/seed/user";
import { createToken } from "../../../../src/services/token.service";
import { createRoleWithPermissions } from "../../../utils/createRoleWithPermissions";
import { removeRoleFromUserId } from "../../../utils/roles";

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

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.statusCode).toBe(401);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER_FORMAT");
  });

  it("should throw INVALID_TOKEN", async () => {
    const response = await supertest(app)
      .get("/api/v1/users/profile")
      .set("Authorization", "Bearer InvalidJWTToken");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.statusCode).toBe(401);
    expect(response.body.code).toBe("INVALID_TOKEN");
  });

  it("should throw 'SERVER_ERROR' for passing empty JWT token", async () => {
    const fakeToken = createToken({}, {});

    const response = await supertest(app)
      .get("/api/v1/users/profile")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.statusCode).toBe(500);
    expect(response.body.code).toBe("SERVER_ERROR");
  });

  it("should throw 'USER_NOT_FOUND' error with fake user ID", async () => {
    const nonExistentUserId = uuid();
    const fakeToken = createToken(
      { userId: nonExistentUserId },
      { expiresIn: "1h" },
    );

    const response = await supertest(app)
      .get("/api/v1/users/profile")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.statusCode).toBe(404);
    expect(response.body.code).toBe("USER_NOT_FOUND");
  });

  it("should throw 'USER_BLOCK' error for blocked user", async () => {
    const userId = uuid();
    await createUser({
      id: userId,
      isBlocked: true,
    });
    const token = createToken({ userId }, { expiresIn: "1h" });

    const response = await supertest(app)
      .get("/api/v1/users/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("USER_BLOCK");
  });

  it("should throw 'ACCESS_DENIED' when user has no permissions", async () => {
    const { user } = await createUser();
    const token = createToken({ userId: user.userId }, { expiresIn: "1h" });
    await removeRoleFromUserId(user.userId, {
      name: "@everyone",
    });

    const response = await supertest(app)
      .get("/api/v1/users/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("ACCESS_DENIED");
  });

  it("should get user profile", async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .get("/api/v1/users/profile")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.user.name).toBeNull();
    expect(response.body.user.userId).toBe(user.userId);
    expect(response.body.user.username).toBe(user.username);
  });
});

describe("PATCH /api/v1/users/profile", () => {
  describe("Authentication Errors", () => {
    it("should throw INVALID_AUTH_HEADER", async () => {
      const response = await supertest(app)
        .patch("/api/v1/users/profile")
        .send({ name: "New Name" });

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(400);
      expect(response.body.code).toBe("INVALID_AUTH_HEADER");
    });

    it("should throw INVALID_AUTH_HEADER_FORMAT when Authorization header is malformed", async () => {
      const response = await supertest(app)
        .patch("/api/v1/users/profile")
        .set("Authorization", "WrongFormatTokenHere");

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(401);
      expect(response.body.code).toBe("INVALID_AUTH_HEADER_FORMAT");
    });

    it("should throw INVALID_TOKEN", async () => {
      const response = await supertest(app)
        .patch("/api/v1/users/profile")
        .set("Authorization", "Bearer invalid.jwt.token")
        .send({ name: "Name" });

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(401);
      expect(response.body.code).toBe("INVALID_TOKEN");
    });

    it("should throw 'USER_NOT_FOUND' error with fake user ID", async () => {
      const nonExistentUserId = uuid();
      const token = createToken(
        { userId: nonExistentUserId },
        { expiresIn: "1h" },
      );

      const response = await supertest(app)
        .patch("/api/v1/users/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Name" });

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(404);
      expect(response.body.code).toBe("USER_NOT_FOUND");
    });

    it("should throw 'USER_BLOCK' error for blocked user", async () => {
      const userId = uuid();
      await createUser({
        id: userId,
        isBlocked: true,
      });
      const token = createToken({ userId }, { expiresIn: "1h" });

      const response = await supertest(app)
        .patch("/api/v1/users/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Blocked Name" });

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(403);
      expect(response.body.code).toBe("USER_BLOCK");
    });

    it("should throw 'ACCESS_DENIED' when user has no permissions", async () => {
      const { user } = await createUser();
      const token = createToken({ userId: user.userId }, { expiresIn: "1h" });
      await removeRoleFromUserId(user.userId, {
        name: "@everyone",
      });

      const response = await supertest(app)
        .patch("/api/v1/users/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Name" });

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(403);
      expect(response.body.code).toBe("ACCESS_DENIED");
    });
  });

  describe("Name", () => {
    it("should throw error NAME_LENGTH if name exceeds 30 characters", async () => {
      const { user } = await createUser();

      const response = await supertest(app)
        .patch("/api/v1/users/profile")
        .set("Authorization", `Bearer ${user.authToken}`)
        .send({ name: "a".repeat(31) });

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(400);
      expect(response.body.code).toBe("NAME_LENGTH");
    });

    it("should update user's profile name", async () => {
      const { user } = await createUser();
      const newName = "Updated Name";

      const response = await supertest(app)
        .patch("/api/v1/users/profile")
        .set("Authorization", `Bearer ${user.authToken}`)
        .send({ name: newName });

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({
        userId: user.userId,
        name: newName,
        email: user.email,
        username: user.username,
      });
    });
  });
});

describe("[GET] /api/v1/users/permissions", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).get("/api/v1/users/permissions");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should return an array of permissions for '@everyone' role", async () => {
    const { user } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .get("/api/v1/users/permissions")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.permissions).toEqual([
      "post:create",
      "vote:create",
      "vote:destroy",
    ]);
  });
});

describe("[GET] /api/v1/users/dashboard", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).get("/api/v1/users/dashboard");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw error not having 'dashboard:read' permission", async () => {
    const { user: authUser } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .post("/api/v1/roadmaps")
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  it("should return an array of permissions for '@everyone' role", async () => {
    const { user } = await createUser({
      isVerified: true,
    });
    await createRoleWithPermissions(user.userId, ["dashboard:read"], {
      roleName: "Dashboard accessor",
    });

    const response = await supertest(app)
      .get("/api/v1/users/dashboard")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.access).toBeTruthy();
  });
});
