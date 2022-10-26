import { describe, it, expect } from "vitest";
const supertest = require("supertest");
const { v4: uuid } = require("uuid");
import { faker } from "@faker-js/faker";

const app = require("../../../app");
const database = require("../../../database");
const { hashPassword } = require("../../../helpers");
import { board as generateBoards } from "../../utils/generators";
const { getUser } = require("../../utils/getUser");

// Get all boards
describe("GET /api/v1/boards", () => {
  it("should get 0 boards", async () => {
    const response = await supertest(app).get("/api/v1/boards");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.boards).toHaveLength(0);
  });
});

// Get boards by URL
describe("GET /boards/:url", () => {
  it('should throw error "BOARD_NOT_FOUND"', async () => {
    const response = await supertest(app).get("/api/v1/boards/do_not_exists");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toEqual("BOARD_NOT_FOUND");
  });

  it("should get board by url", async () => {
    // generate & add board
    const board = generateBoards();
    const boardName = faker.commerce.product().toLowerCase();
    board.url = boardName;

    await database.insert(board).into("boards");

    const response = await supertest(app).get(`/api/v1/boards/${boardName}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.board).toStrictEqual(board);
  });
});

// Search board by name
describe("GET /boards/search/:name", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).get("/api/v1/boards/search/name");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual("INVALID_AUTH_HEADER");
  });

  it("should throw error not having 'board:read' permission", async () => {
    const userId = uuid();
    const randomEmail = faker.internet.email();
    const username = randomEmail.split("@")[0];

    // seed users with no "board:read permission"
    await database
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
        userId,
      },
    );

    const authUser = await getUser({
      email: randomEmail,
      password: "strongPassword",
    });

    const response = await supertest(app)
      .get("/api/v1/boards/search/name")
      .set("Authorization", `Bearer ${authUser.body.user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toEqual("NOT_ENOUGH_PERMISSION");
  });

  it("should return 0 boards", async () => {
    // seed users with "board:read permission"
    const createUser = await database
      .insert([
        {
          userId: uuid(),
          email: "serchBoard_board-read-permission@example.com",
          password: hashPassword("strongPassword"),
          username: "permission",
        },
      ])
      .into("users")
      .returning(["userId"]);

    // create a new role
    const newRoleId = uuid();
    await database
      .insert({
        id: newRoleId,
        name: "board:read",
        description: "this role has 'board:read' permission",
      })
      .into("roles");

    // find "board:read" permission
    const findPermission = await database
      .select()
      .from("permissions")
      .where({
        type: "board",
        action: "read",
      })
      .first();

    // assign 'board:read' permission to newly created role
    await database
      .insert({
        id: uuid(),
        role_id: newRoleId,
        permission_id: findPermission.id,
      })
      .into("permissions_roles");

    // assign the role to newly created user
    await database
      .insert({
        id: uuid(),
        role_id: newRoleId,
        user_id: createUser[0].userId,
      })
      .into("roles_users");

    const authUser = await getUser({
      email: "serchBoard_board-read-permission@example.com",
      password: "strongPassword",
    });

    const response = await supertest(app)
      .get("/api/v1/boards/search/name")
      .set("Authorization", `Bearer ${authUser.body.user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.boards).toHaveLength(0);
  });
});

// Create new boards
describe("POST /api/v1/boards", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).post("/api/v1/boards");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual("INVALID_AUTH_HEADER");
  });

  it("should throw error not having 'board:create' permission", async () => {
    // seed users with no "board:create permission"
    const createUser = await database
      .insert([
        {
          userId: uuid(),
          email: "boards_createBoard@example.com",
          password: hashPassword("strongPassword"),
          username: "boards_createBoard",
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

    const authUser = await getUser({
      email: "boards_createBoard@example.com",
      password: "strongPassword",
    });

    const response = await supertest(app)
      .post("/api/v1/boards")
      .set("Authorization", `Bearer ${authUser.body.user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toEqual("NOT_ENOUGH_PERMISSION");
  });

  // it("should create a board", async () => {
  //   // seed users with "board:create permission"
  //   const createUser = await database
  //     .insert([
  //       {
  //         userId: uuid(),
  //         email: "create-board@example.com",
  //         password: hashPassword("strongPassword"),
  //         username: "create-board",
  //       },
  //     ])
  //     .into("users")
  //     .returning(["userId"]);
  // });
});
