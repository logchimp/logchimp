const supertest = require("supertest");
const { v4: uuid } = require("uuid");

const app = require("../../../server");
const database = require("../../../server/database");
const { getUser } = require("../../utils/getUser");
const { hashPassword } = require("../../../server/helpers");
const cleanDatabase = require("../../utils/cleanDatabase");

beforeEach(() => cleanDatabase());

// Get all roles
describe("GET /api/v1/roles", () => {
  it("should not have permission 'role:read'", async () => {
    // create simple user (without any permissions) for getting roles
    const createUser = await database
      .insert([
        {
          userId: uuid(),
          email: "no-permission@example.com",
          password: hashPassword("strongPassword"),
          username: "no-permission",
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
      email: "no-permission@example.com",
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
  it.only("should get all the roles", async () => {
    // role:read
    const createUser = await database
      .insert([
        {
          userId: uuid(),
          email: "role-read-user@example.com",
          password: hashPassword("strongPassword"),
          username: "role-read-user",
        },
      ])
      .into("users")
      .returning(["userId"]);

    const roleId = uuid();
    await database.transaction((t) => {
      return database("roles")
        .transacting(t)
        .insert({
          id: roleId,
          name: "CreateRole",
        })
        .then(() => {
          return database
            .transacting(t)
            .select("id")
            .from("permissions")
            .where({
              type: "role",
              action: "read",
            })
            .first()
            .then((response) => {
              database("permissions_roles").transacting(t).insert({
                id: uuid(),
                role_id: roleId,
                permission_id: response.id,
              });

              return database("roles_users")
                .transacting(t)
                .insert({
                  id: uuid(),
                  role_id: roleId,
                  user_id: createUser[0].userId,
                });
            });
        })
        .then(t.commit)
        .catch(t.rollback);
    });

    const authUser = await getUser({
      email: "role-read-user@example.com",
      password: "strongPassword",
    });

    const response = await supertest(app)
      .get("/api/v1/roles")
      .set("Authorization", `Bearer ${authUser.body.user.authToken}`);

    console.log(response.body);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    // expect(response.body.code).toEqual("NOT_ENOUGH_PERMISSION");
  });
});

describe("PUT /api/v1/roles/:role_id/users/:user_id", () => {
  // 1. permission check
  // 2. if it assigns the role to a user
  it("should not have 'role:assign' permission", () => {});
});
