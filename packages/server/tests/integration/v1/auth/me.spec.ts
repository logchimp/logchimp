import { describe, expect, it } from "vitest";
import supertest from "supertest";
import { v4 as uuid } from "uuid";
import type { TPermission } from "@logchimp/types";

import app from "../../../../src/app";
import { createUser } from "../../../utils/seed/user";
import { createToken } from "../../../../src/services/token.service";
import { createRoleWithPermissions } from "../../../utils/createRoleWithPermissions";
import { removeRoleFromUserId } from "../../../utils/roles";

const everyonePermissions = [
  "post:create",
  "vote:create",
  "vote:destroy",
  "comment:create",
  "comment:update:own",
] satisfies TPermission[];

describe("GET /api/v1/auth/me", () => {
  it("should throw INVALID_AUTH_HEADER", async () => {
    const response = await supertest(app).get("/api/v1/auth/me");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw INVALID_AUTH_HEADER_FORMAT", async () => {
    const response = await supertest(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "WrongFormatTokenHere");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER_FORMAT");
  });

  it("should throw INVALID_TOKEN", async () => {
    const response = await supertest(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer InvalidJWTToken");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_TOKEN");
  });

  it("should throw 'SERVER_ERROR' for passing empty JWT token", async () => {
    const fakeToken = createToken({}, {});

    const response = await supertest(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(500);
    expect(response.body.code).toBe("SERVER_ERROR");
  });

  it("should throw 'USER_NOT_FOUND' error with fake user ID", async () => {
    const nonExistentUserId = uuid();
    const fakeToken = createToken(
      { userId: nonExistentUserId },
      { expiresIn: "1h" },
    );

    const response = await supertest(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${fakeToken}`);

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
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("USER_BLOCK");
  });

  it("should throw 'ACCESS_DENIED' when user has no permissions", async () => {
    const { user } = await createUser();
    await removeRoleFromUserId(user.userId, {
      name: "@everyone",
      isSystem: true,
    });

    const response = await supertest(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("ACCESS_DENIED");
  });

  it("should get the currently authenticated user", async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      userId: user.userId,
      email: user.email,
      username: user.username,
    });
    expect(response.body.user.name).toBeNull();
    expect(response.body.user.avatar).toBeNull();
  });

  it("should not expose password or auth token", async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.user.password).toBeUndefined();
    expect(response.body.user.authToken).toBeUndefined();
    expect(Object.keys(response.body.user).sort()).toEqual(
      ["userId", "name", "email", "avatar", "username", "permissions"].sort(),
    );
  });

  it("should get the user's name once it is set", async () => {
    const name = "Alex Doe";
    const { user } = await createUser({ name });

    const response = await supertest(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.user.name).toBe(name);
  });

  it("should return permissions of the '@everyone' role", async () => {
    const { user } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.status).toBe(200);
    expect([...response.body.user.permissions].sort()).toEqual(
      [...everyonePermissions].sort(),
    );
  });

  it("should include permissions from additionally assigned roles", async () => {
    const { user } = await createUser({
      isVerified: true,
    });
    await createRoleWithPermissions(user.userId, ["dashboard:read"], {
      roleName: "Dashboard accessor",
    });

    const response = await supertest(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.status).toBe(200);
    expect([...response.body.user.permissions].sort()).toEqual(
      [...everyonePermissions, "dashboard:read"].sort(),
    );
  });

  it("should return all permissions for the site owner", async () => {
    const { user } = await createUser({
      isOwner: true,
      isVerified: true,
    });

    const response = await supertest(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.user.permissions).toEqual(
      expect.arrayContaining([...everyonePermissions, "dashboard:read"]),
    );
    expect(response.body.user.permissions.length).toBeGreaterThan(
      everyonePermissions.length,
    );
  });
});
