import { describe, expect, it } from "vitest";
import supertest from "supertest";
import { v4 as uuid } from "uuid";
import { faker } from "@faker-js/faker";

import app from "../../../src/app";
import database from "../../../src/database";
import { createUser } from "../../utils/seed/user";
import { role as generateRole } from "../../utils/generators";
import { createRoleWithPermissions } from "../../utils/createRoleWithPermissions";

// Get all roles
describe("GET /api/v1/roles", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).get("/api/v1/roles");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
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

  it("should get all the roles", async () => {
    // delete all roles, except '@everyone' role
    await database.del().from("roles").where("name", "!=", "@everyone");

    const { user } = await createUser();
    await createRoleWithPermissions(user.userId, ["role:read"], {
      roleName: "Spectator",
    });

    const response = await supertest(app)
      .get("/api/v1/roles")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.roles).toHaveLength(2);
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
    const r1 = await generateRole();

    const response = await supertest(app)
      .patch("/api/v1/roles")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        id: r1.id,
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
    const r1 = await generateRole();

    const response = await supertest(app)
      .get(`/api/v1/roles/${r1.id}`)
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
    const r1 = await generateRole();

    const response = await supertest(app)
      .get(`/api/v1/roles/${r1.id}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");

    const role = response.body.role;
    expect(role.name).toBe(r1.name);
    expect(role.description).toBeNull();

    expect(response.body.role.permissions).toHaveLength(0);
    expect(response.body.role.permissions).toStrictEqual([]);
  });

  // TODO: add test case get role by ID with permissions
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

  it.skip('should throw error "ROLE_NOT_FOUND"', async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .put(`/api/v1/roles/${uuid()}/users/${uuid()}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("ROLE_NOT_FOUND");
  });

  it.skip('should throw error "USER_NOT_FOUND"', async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .put(`/api/v1/roles/${uuid()}/users/${uuid()}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("USER_NOT_FOUND");
  });

  it("should not have 'role:assign' permission", async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .put(`/api/v1/roles/${uuid()}/users/${uuid()}`)
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
    const r1 = await generateRole();

    const response = await supertest(app)
      .put(`/api/v1/roles/${r1.id}/users/${user.userId}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);

    expect(response.body.success).toBe(1);
    expect(response.body.id).toBe(r1.id);
    expect(response.body.name).toBe(r1.name);
  });

  it("should throw error 'ROLE_USER_CONFLICT' on assigning role twice to same user", async () => {
    const { user } = await createUser();
    await createRoleWithPermissions(user.userId, ["role:assign"], {
      roleName: "Role assigner",
    });
    const r1 = await generateRole();

    await supertest(app)
      .put(`/api/v1/roles/${r1.id}/users/${user.userId}`)
      .set("Authorization", `Bearer ${user.authToken}`);
    const response = await supertest(app)
      .put(`/api/v1/roles/${r1.id}/users/${user.userId}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(409);

    expect(response.body.success).toBe(0);
  });
});

describe("DELETE /api/v1/roles/:role_id/users/:user_id", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).put(
      `/api/v1/roles/${uuid()}/users/${uuid()}`,
    );

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it.skip('should throw error "ROLE_NOT_FOUND"', async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .put(`/api/v1/roles/${uuid()}/users/${uuid()}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("ROLE_NOT_FOUND");
  });

  it.skip('should throw error "USER_NOT_FOUND"', async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .put(`/api/v1/roles/${uuid()}/users/${uuid()}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("USER_NOT_FOUND");
  });

  it("should not have 'role:unassign' permission", async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .put(`/api/v1/roles/${uuid()}/users/${uuid()}`)
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
    const r1 = await generateRole();

    await supertest(app)
      .put(`/api/v1/roles/${r1.id}/users/${user.userId}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    const response = await supertest(app)
      .delete(`/api/v1/roles/${r1.id}/users/${user.userId}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.status).toBe(204);
  });
});
