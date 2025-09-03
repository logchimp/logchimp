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
    expect(response.body.code).toEqual("INVALID_AUTH_HEADER");
  });

  it("should not have permission 'role:read'", async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .get("/api/v1/roles")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toEqual("NOT_ENOUGH_PERMISSION");
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
    expect(response.body.roles.length).toEqual(2);
  });
});

describe("POST /api/v1/roles", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).post("/api/v1/roles");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual("INVALID_AUTH_HEADER");
  });

  it("should not have permission 'role:create'", async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .post("/api/v1/roles")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toEqual("NOT_ENOUGH_PERMISSION");
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
    expect(role.name).toEqual("new role");
    expect(role.description).toBeNull();
  });
});

describe("PATCH /api/v1/roles", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).patch("/api/v1/roles");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual("INVALID_AUTH_HEADER");
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
    expect(response.body.code).toEqual("NOT_ENOUGH_PERMISSION");
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
    expect(response.body.code).toEqual("ROLE_NOT_FOUND");
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
    expect(resRole.name).toEqual(name);
    expect(resRole.description).toEqual(description);

    expect(response.body.permissions).toEqual([]);
    expect(response.body.permissions).toHaveLength(0);
  });

  // TODO: handle case to update permissions as well
});

describe("PUT /api/v1/roles/:role_id/users/:user_id", () => {
  // 1. permission check
  // 2. if it assigns the role to a user
  it("should not have 'role:assign' permission", () => {});
});
