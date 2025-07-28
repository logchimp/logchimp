import { describe, it, expect } from "vitest";
const supertest = require("supertest");
const { v4: uuid } = require("uuid");

const app = require("../../../app");
const database = require("../../../database");
import { createUser } from "../../utils/seed/user";

// Get all roles
describe("GET /api/v1/roles", () => {
  it("should not have permission 'role:read'", async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .get("/api/v1/roles")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toEqual("NOT_ENOUGH_PERMISSION");
  });

  // 2. get all roles
  it("should get all the roles", async () => {
    // delete all roles, except '@everyone' role
    await database.del().from("roles").where("name", "!=", "@everyone");

    const { user } = await createUser();

    const roleId = uuid();
    await database
      .insert({
        id: roleId,
        name: "CreateRole",
      })
      .into("roles");

    const readRolePerms = await database
      .select("id")
      .from("permissions")
      .where({
        type: "role",
        action: "read",
      })
      .first();

    await database
      .insert({
        id: uuid(),
        role_id: roleId,
        permission_id: readRolePerms.id,
      })
      .into("permissions_roles");

    await database
      .insert({
        id: uuid(),
        role_id: roleId,
        user_id: user.userId,
      })
      .into("roles_users");

    const response = await supertest(app)
      .get("/api/v1/roles")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.roles.length).toEqual(2);
  });
});

describe("PUT /api/v1/roles/:role_id/users/:user_id", () => {
  // 1. permission check
  // 2. if it assigns the role to a user
  it("should not have 'role:assign' permission", () => {});
});
