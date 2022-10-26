import { describe, it, expect } from "vitest";
const supertest = require("supertest");
const { v4: uuid } = require("uuid");
import { faker } from "@faker-js/faker";

const app = require("../../../app");
const database = require("../../../database");
import { getUser } from "../../utils/getUser";
const { hashPassword } = require("../../../helpers");

// Get all roles
describe("GET /api/v1/roles", () => {
  it("should not have permission 'role:read'", async () => {
    const userId = uuid();
    const randomEmail = faker.internet.email("no-permission");
    const username = randomEmail.split("@")[0];

    // create simple user (without any permissions) for getting roles
    const createUser = await database
      .insert([
        {
          userId,
          email: randomEmail,
          password: hashPassword("strongPassword"),
          username,
        },
      ])
      .into("users")
      .returning(["userId"]);

    // assign '@everyone' role to user
    await database.raw(
      `
      INSERT INTO roles_users (id, role_id, user_id)
      VALUES(:uuid, (
          SELECT
            id FROM roles
          WHERE
            name = '@everyone'
          ), :userId)
    `,
      {
        uuid: uuid(),
        userId: createUser[0].userId,
      },
    );

    const user = await getUser({
      email: randomEmail,
      password: "strongPassword",
    });

    const response = await supertest(app)
      .get("/api/v1/roles")
      .set("Authorization", `Bearer ${user.body.user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toEqual("NOT_ENOUGH_PERMISSION");
  });

  // 2. get all roles
  it("should get all the roles", async () => {
    const userId = uuid();
    const randomEmail = faker.internet.email("role-read-user");
    const username = randomEmail.split("@")[0];

    // role:read
    const createUser = await database
      .insert([
        {
          userId,
          email: randomEmail,
          password: hashPassword("strongPassword"),
          username,
        },
      ])
      .into("users")
      .returning(["userId"]);

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
        user_id: createUser[0].userId,
      })
      .into("roles_users");

    const authUser = await getUser({
      email: randomEmail,
      password: "strongPassword",
    });

    const response = await supertest(app)
      .get("/api/v1/roles")
      .set("Authorization", `Bearer ${authUser.body.user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.roles.length).toBeGreaterThanOrEqual(3);
  });
});

describe("PUT /api/v1/roles/:role_id/users/:user_id", () => {
  // 1. permission check
  // 2. if it assigns the role to a user
  it("should not have 'role:assign' permission", () => {});
});
