import { describe, expect, it, beforeAll } from "vitest";
import supertest from "supertest";
import { v4 as uuid } from "uuid";
import { faker } from "@faker-js/faker";
import type { IAuthUser, IRole, TPermission } from "@logchimp/types";

import app from "../../../src/app";
import database from "../../../src/database";
import { createUser } from "../../utils/seed/user";
import { role as generateRole } from "../../utils/generators";
import { createRoleWithPermissions } from "../../utils/createRoleWithPermissions";
import { toSlug } from "../../../src/helpers";

const roleIdSlug = toSlug(faker.commerce.productName());
const userIdSlug = toSlug(faker.commerce.productName());

// Get all roles
describe("GET /api/v1/roles", () => {
  let authUser: IAuthUser;
  beforeAll(async () => {
    await database.transaction(async (trx) => {
      // Seed 30 roles
      for (let i = 0; i < 30; i++) {
        await trx("roles").insert({
          id: uuid(),
          name: faker.commerce.productName().substring(0, 30),
          description: faker.commerce.productDescription().substring(0, 50),
        });
      }
    });

    const { user } = await createUser();
    authUser = user;
    await createRoleWithPermissions(user.userId, ["role:read"], {
      roleName: "Spectator",
    });
  });

  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).get("/api/v1/roles");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it.skip("should get 0 roles", async () => {
    const response = await supertest(app).get("/api/v1/roles");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(0);
    expect(response.body.roles).toHaveLength(0);
  });

  it("should not have permission 'role:read'", async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .get("/api/v1/roles")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  describe("'?after=' param", () => {
    it("should handle cursor pagination correctly", async () => {
      const res1 = await supertest(app)
        .get("/api/v1/roles")
        .query({ first: 3 })
        .set("Authorization", `Bearer ${authUser.authToken}`);
      expect(res1.headers["content-type"]).toContain("application/json");
      const lastId = res1.body.results[2].id;
      expect(res1.body.page_info.start_cursor).toBe(res1.body.results[0].id);
      expect(res1.body.page_info.end_cursor).toBe(lastId);

      const res2 = await supertest(app)
        .get("/api/v1/roles")
        .query({
          first: 3,
          after: lastId,
        })
        .set("Authorization", `Bearer ${authUser.authToken}`);
      expect(res2.headers["content-type"]).toContain("application/json");
      expect(res2.status).toBe(200);
      expect(res2.body.results).toHaveLength(3);
      expect(res2.body.page_info.start_cursor).toBeTypeOf("string");
      expect(res2.body.page_info.end_cursor).toBeTypeOf("string");
      expect(res2.body.page_info.start_cursor).toBe(res2.body.results[0].id);
      expect(res2.body.page_info.end_cursor).toBe(res2.body.results[2].id);

      const ids1 = res1.body.results.map((r: IRole) => r.id);
      const ids2 = res2.body.results.map((r: IRole) => r.id);
      expect(ids1.some((id: string) => ids2.includes(id))).toBe(false);
    });

    it("should throw 'VALIDATION_ERROR' error for invalid '?after=' param", async () => {
      const res = await supertest(app)
        .get("/api/v1/roles")
        .query({
          first: 3,
          after: "invalid-uuid",
        })
        .set("Authorization", `Bearer ${authUser.authToken}`);

      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_ERROR");
      expect(res.body.errors).toBeDefined();
    });

    it("should handle empty '?after=' param gracefully", async () => {
      const res = await supertest(app)
        .get("/api/v1/roles")
        .query({
          first: 3,
          after: "",
        })
        .set("Authorization", `Bearer ${authUser.authToken}`);

      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.status).toBe(400);

      expect(res.body.code).toBe("VALIDATION_ERROR");
      expect(res.body.message).toBe("Invalid query parameters");
      expect(res.body.errors?.[0]?.message).toMatch(/INVALID_UUID/gi);
    });
  });
});

describe("POST /api/v1/roles", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).post("/api/v1/roles");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should not have permission 'role:create'", async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .post("/api/v1/roles")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  it("should create a role with default values", async () => {
    const { user } = await createUser();
    await createRoleWithPermissions(user.userId, ["role:create"], {
      roleName: "Role creator",
    });
    const response = await supertest(app)
      .post("/api/v1/roles")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(201);

    const role = response.body.role;
    expect(role.name).toBe("new role");
    expect(role.description).toBeNull();
  });
});

describe("PATCH /api/v1/roles", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).patch("/api/v1/roles");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should not have permission 'role:update'", async () => {
    const { user } = await createUser();
    const generatedRole = await generateRole();

    const response = await supertest(app)
      .patch("/api/v1/roles")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        id: generatedRole.id,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  it('should throw error "ROLE_NOT_FOUND"', async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .patch("/api/v1/roles")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        id: uuid(),
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("ROLE_NOT_FOUND");
  });

  it("should update role", async () => {
    const { user } = await createUser();
    const role = await createRoleWithPermissions(user.userId, ["role:update"], {
      roleName: "Role update",
    });

    const name = "role updated!!!!";
    const description = faker.commerce.productDescription().substring(0, 50);
    const response = await supertest(app)
      .patch("/api/v1/roles")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        id: role,
        name,
        description,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);

    const resRole = response.body.role;
    expect(resRole.name).toBe(name);
    expect(resRole.description).toBe(description);

    expect(response.body.permissions).toStrictEqual([]);
    expect(response.body.permissions).toHaveLength(0);
  });

  // TODO: handle case to update permissions as well
});

// TODO: implement this API first
// describe("DELETE /api/v1/roles", () => {});

describe("GET /api/v1/roles/:id", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).get(`/api/v1/roles/${uuid()}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw error 'INVALID_AUTH_HEADER_FORMAT' when auth header is malformed", async () => {
    const { user: authUser } = await createUser({ isVerified: true });

    const response = await supertest(app)
      .get(`/api/v1/roles/${uuid()}`)
      .set("Authorization", `Beare${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER_FORMAT");
  });

  it(`should throw error "DECODE_URI_ERROR" with :id as "*&^(*&$%&*^&%&^%*"`, async () => {
    const response = await supertest(app).delete(
      `/api/v1/roles/*&^(*&$%&*^&%&^%*`,
    );

    expect(response.headers["content-type"]).toContain("application/json");

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("DECODE_URI_ERROR");
  });

  it('should throw error "ROLE_NOT_FOUND"', async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .get(`/api/v1/roles/${uuid()}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("ROLE_NOT_FOUND");
  });

  it("should not have permission 'role:read'", async () => {
    const { user } = await createUser();
    const generatedRole = await generateRole();

    const response = await supertest(app)
      .get(`/api/v1/roles/${generatedRole.id}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  it("should get role by ID and empty permissions list", async () => {
    const { user } = await createUser();
    await createRoleWithPermissions(user.userId, ["role:read"], {
      roleName: "Role reader",
    });
    const generatedRole = await generateRole();

    const response = await supertest(app)
      .get(`/api/v1/roles/${generatedRole.id}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");

    const role = response.body.role;
    expect(role.name).toBe(generatedRole.name);
    expect(role.description).toBeNull();

    expect(response.body.role.permissions).toHaveLength(0);
    expect(response.body.role.permissions).toStrictEqual([]);
  });

  it("should get role by ID with permissions", async () => {
    const { user } = await createUser();
    const permissions: TPermission[] = [
      "post:read",
      "post:create",
      "post:update",
      "post:destroy",
      "board:read",
      "board:create",
      "board:update",
      "board:destroy",
      "board:assign",
      "board:unassign",
      "vote:create",
      "vote:destroy",
      "vote:assign",
      "vote:unassign",
      "role:read",
    ];
    const roleName = "Custom role";
    const roleId = await createRoleWithPermissions(user.userId, permissions, {
      roleName,
    });

    const response = await supertest(app)
      .get(`/api/v1/roles/${roleId}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.body.role.id).toEqual(roleId);
    expect(response.body.role.name).toEqual(roleName);
    expect(response.body.role.permissions).toEqual(permissions);
  });
});

describe("PUT /api/v1/roles/:role_id/users/:user_id", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).put(
      `/api/v1/roles/${uuid()}/users/${uuid()}`,
    );

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw error 'INVALID_AUTH_HEADER_FORMAT' when auth header is malformed", async () => {
    const { user: authUser } = await createUser({ isVerified: true });

    const response = await supertest(app)
      .put(`/api/v1/roles/${uuid()}/users/${uuid()}`)
      .set("Authorization", `Beare${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER_FORMAT");
  });

  [
    undefined,
    null,
    57241,
    roleIdSlug,

    // VBScript and Other Protocols
    `vbscript:msgbox("XSS")`,
    `livescript:alert('XSS')`,
    `mocha:alert('XSS')`,
    `charset:alert('XSS')`,

    "%20", // Just whitespace
  ].map((value) =>
    it(`should throw error "INVALID_ROLE_ID" for role_id value "${value}"`, async () => {
      const { user } = await createUser();

      const response = await supertest(app)
        .put(`/api/v1/roles/${value}/users/${uuid()}`)
        .set("Authorization", `Bearer ${user.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(400);
      expect(response.body.code).toBe("INVALID_ROLE_ID");
    }),
  );

  it('should throw error "ROLE_NOT_FOUND"', async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .put(`/api/v1/roles/${uuid()}/users/${uuid()}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("ROLE_NOT_FOUND");
  });

  [
    undefined,
    null,
    57241,
    userIdSlug,

    // VBScript and Other Protocols
    `vbscript:msgbox("XSS")`,
    `livescript:alert('XSS')`,
    `mocha:alert('XSS')`,
    `charset:alert('XSS')`,

    "%20", // Just whitespace
  ].map((value) =>
    it(`should throw error "INVALID_USER_ID" for user_id value "${value}"`, async () => {
      const { user } = await createUser();
      const generatedRole = await generateRole();

      const response = await supertest(app)
        .put(`/api/v1/roles/${generatedRole.id}/users/${value}`)
        .set("Authorization", `Bearer ${user.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(400);
      expect(response.body.code).toBe("INVALID_USER_ID");
    }),
  );

  it('should throw error "USER_NOT_FOUND"', async () => {
    const { user } = await createUser();
    const generatedRole = await generateRole();

    const response = await supertest(app)
      .put(`/api/v1/roles/${generatedRole.id}/users/${uuid()}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("USER_NOT_FOUND");
  });

  it(`should throw error "DECODE_URI_ERROR" with :userId & :roleId as "*&^(*&$%&*^&%&^%*"`, async () => {
    const response = await supertest(app).put(
      `/api/v1/roles/*&^(*&$%&*^&%&^%*/users/*&^(*&$%&*^&%&^%*`,
    );

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("DECODE_URI_ERROR");
  });

  it("should not have 'role:assign' permission", async () => {
    const { user } = await createUser();
    const generatedRole = await generateRole();

    const response = await supertest(app)
      .put(`/api/v1/roles/${generatedRole.id}/users/${user.userId}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  it("should assign role to new user", async () => {
    const { user } = await createUser();
    await createRoleWithPermissions(user.userId, ["role:assign"], {
      roleName: "Role assigner",
    });
    const generatedRole = await generateRole();

    const response = await supertest(app)
      .put(`/api/v1/roles/${generatedRole.id}/users/${user.userId}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);

    expect(response.body.success).toBe(1);
    expect(response.body.id).toBe(generatedRole.id);
    expect(response.body.name).toBe(generatedRole.name);
  });

  it("should throw error 'ROLE_USER_CONFLICT' on assigning role twice to same user", async () => {
    const { user } = await createUser();
    await createRoleWithPermissions(user.userId, ["role:assign"], {
      roleName: "Role assigner",
    });
    const generatedRole = await generateRole();

    await supertest(app)
      .put(`/api/v1/roles/${generatedRole.id}/users/${user.userId}`)
      .set("Authorization", `Bearer ${user.authToken}`);
    const response = await supertest(app)
      .put(`/api/v1/roles/${generatedRole.id}/users/${user.userId}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(409);

    expect(response.body.success).toBe(0);
  });
});

describe("DELETE /api/v1/roles/:role_id/users/:user_id", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).delete(
      `/api/v1/roles/${uuid()}/users/${uuid()}`,
    );

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw error 'INVALID_AUTH_HEADER_FORMAT' when auth header is malformed", async () => {
    const { user: authUser } = await createUser({ isVerified: true });

    const response = await supertest(app)
      .delete(`/api/v1/roles/${uuid()}/users/${uuid()}`)
      .set("Authorization", `Beare${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER_FORMAT");
  });

  [
    undefined,
    null,
    57241,
    roleIdSlug,

    // VBScript and Other Protocols
    `vbscript:msgbox("XSS")`,
    `livescript:alert('XSS')`,
    `mocha:alert('XSS')`,
    `charset:alert('XSS')`,

    "%20", // Just whitespace
  ].map((value) =>
    it(`should throw error "INVALID_ROLE_ID" for role_id value "${value}"`, async () => {
      const { user } = await createUser();

      const response = await supertest(app)
        .delete(`/api/v1/roles/${value}/users/${uuid()}`)
        .set("Authorization", `Bearer ${user.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(400);
      expect(response.body.code).toBe("INVALID_ROLE_ID");
    }),
  );

  it('should throw error "ROLE_NOT_FOUND"', async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .delete(`/api/v1/roles/${uuid()}/users/${uuid()}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("ROLE_NOT_FOUND");
  });

  [
    undefined,
    null,
    57241,
    userIdSlug,

    // VBScript and Other Protocols
    `vbscript:msgbox("XSS")`,
    `livescript:alert('XSS')`,
    `mocha:alert('XSS')`,
    `charset:alert('XSS')`,

    "%20", // Just whitespace
  ].map((value) =>
    it(`should throw error "INVALID_USER_ID" for user_id value "${value}"`, async () => {
      const { user } = await createUser();
      const generatedRole = await generateRole();

      const response = await supertest(app)
        .delete(`/api/v1/roles/${generatedRole.id}/users/${value}`)
        .set("Authorization", `Bearer ${user.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(400);
      expect(response.body.code).toBe("INVALID_USER_ID");
    }),
  );

  it('should throw error "USER_NOT_FOUND"', async () => {
    const { user } = await createUser();
    const generatedRole = await generateRole();

    const response = await supertest(app)
      .delete(`/api/v1/roles/${generatedRole.id}/users/${uuid()}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("USER_NOT_FOUND");
  });

  it(`should throw error "DECODE_URI_ERROR" with :userId & :roleId as "*&^(*&$%&*^&%&^%*"`, async () => {
    const response = await supertest(app).delete(
      `/api/v1/roles/*&^(*&$%&*^&%&^%*/users/*&^(*&$%&*^&%&^%*`,
    );

    expect(response.headers["content-type"]).toContain("application/json");

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("DECODE_URI_ERROR");
  });

  it("should not have 'role:unassign' permission", async () => {
    const { user } = await createUser();
    const generatedRole = await generateRole();

    const response = await supertest(app)
      .put(`/api/v1/roles/${generatedRole.id}/users/${user.userId}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  it("should unassign role to new user", async () => {
    const { user } = await createUser();
    await createRoleWithPermissions(user.userId, ["role:unassign"], {
      roleName: "Role assigner",
    });
    const generatedRole = await generateRole();

    await supertest(app)
      .put(`/api/v1/roles/${generatedRole.id}/users/${user.userId}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    const response = await supertest(app)
      .delete(`/api/v1/roles/${generatedRole.id}/users/${user.userId}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.status).toBe(204);
  });
});
