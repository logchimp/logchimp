import { describe, expect, it } from "vitest";
import supertest from "supertest";
import app from "../../../src/app";
import database from "../../../src/database";
import { createUser } from "../../utils/seed/user";
import { createRoleWithPermissions } from "../../utils/createRoleWithPermissions";

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

    await createRoleWithPermissions(user.userId, ["role:read"], {
      roleName: "CreateRole",
    });

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
