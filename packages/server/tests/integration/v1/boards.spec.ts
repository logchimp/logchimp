import { describe, it, expect } from "vitest";
import supertest from "supertest";
import { faker } from "@faker-js/faker";

import app from "../../../src/app";
import { board as generateBoards } from "../../utils/generators";
import { createUser } from "../../utils/seed/user";
import { cleanDb } from "../../utils/db";
import { createRoleWithPermissions } from "../../utils/createRoleWithPermissions";

// Get all boards
describe("GET /api/v1/boards", () => {
  it("should get 0 boards", async () => {
    await cleanDb();

    const response = await supertest(app).get("/api/v1/boards");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.boards).toHaveLength(0);
  });
});

// Get boards by URL
describe("GET /boards/:url", () => {
  [
    "BOARD_NOT_FOUND",
    "undefined",
    "null",
    null,
    undefined,
    "456575634",
    "board name with spaces",
    "board+with+plus",
    "board#with#hash",
    "a@@@@@@@@",
    // TODO: add this test case - not working for some reason
    // "*&^(*&$%&*^&%&^%*",
  ].map((name) =>
    it.only(`should throw error "BOARD_NOT_FOUND" for '${name}'`, async () => {
      const res = await supertest(app)
        .get(`/api/v1/boards/${name}`)
        .buffer(true)
        .set("Accept", "application/json");
      // .parse(supertest.parse["application/json"]);

      console.log(res.headers["content-type"]);
      console.log(res.body);
      console.log(res.status);
      // expect(res.headers["content-type"]).toContain("application/json");
      // expect(res.status).toBe(404);
      // expect(res.body.code).toBe("BOARD_NOT_FOUND");
    }),
  );

  it("should get board by url", async () => {
    const board = await generateBoards({}, true);

    const response = await supertest(app).get(`/api/v1/boards/${board.url}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);

    delete board.updatedAt;
    expect(response.body.board).toStrictEqual({
      ...board,
      post_count: "0",
    });
  });
});

// Search board by name
describe("GET /boards/search/:name", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).get("/api/v1/boards/search/name");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw error not having 'board:read' permission", async () => {
    const { user: authUser } = await createUser();
    const response = await supertest(app)
      .get("/api/v1/boards/search/name")
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  [
    "BOARD_NOT_FOUND",
    "undefined",
    "null",
    null,
    undefined,
    "456575634",
    "board name with spaces",
    "board+with+plus",
    "board#with#hash",
    "a@@@@@@@@",
    // TODO: add this test case - not working for some reason
    // "*&^(*&$%&*^&%&^%*",
  ].map((name) =>
    it(`should return 0 search results for '${name}' boards`, async () => {
      const { user: authUser } = await createUser();
      await createRoleWithPermissions(authUser.userId, ["board:read"], {
        roleName: "Board Reader",
      });

      const response = await supertest(app)
        .get(`/api/v1/boards/search/${name}`)
        .set("Authorization", `Bearer ${authUser.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(200);
      expect(response.body.boards).toHaveLength(0);
    }),
  );

  const boardName = faker.commerce
    .productName()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .substring(0, 50)
    .replace(/^-+|-+$/g, "");
  it("should show 2 matching boards", async () => {
    const board1 = await generateBoards(
      {
        name: `${boardName}_one`,
      },
      true,
    );
    const board2 = await generateBoards(
      {
        name: `${boardName}_two`,
      },
      true,
    );

    const { user: authUser } = await createUser();
    await createRoleWithPermissions(authUser.userId, ["board:read"], {
      roleName: "Board Reader",
    });

    const response = await supertest(app)
      .get(`/api/v1/boards/search/${boardName}`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);

    const boards = response.body.boards;
    expect(boards).toHaveLength(2);

    // b1
    expect(boards[0].boardId).toBe(board1.boardId);
    expect(boards[0].name).toBe(board1.name);
    expect(boards[0].url).toBe(board1.url);
    expect(boards[0].color).toBe(board1.color);
    expect(boards[0].display).toBe(board1.display);

    // b2
    expect(boards[1].boardId).toBe(board2.boardId);
    expect(boards[1].name).toBe(board2.name);
    expect(boards[1].url).toBe(board2.url);
    expect(boards[1].color).toBe(board2.color);
    expect(boards[1].display).toBe(board2.display);
  });
});

// Create new boards
describe("POST /api/v1/boards", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).post("/api/v1/boards");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw error not having 'board:create' permission", async () => {
    const { user: authUser } = await createUser();

    const response = await supertest(app)
      .post("/api/v1/boards")
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
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

// Delete boards by id
describe("DELETE /api/v1/boards", () => {
  it("should throw error 'NOT_ENOUGH_PERMISSION'", async () => {
    const board = await generateBoards({}, true);
    const { user: authUser } = await createUser();

    const response = await supertest(app)
      .delete(`/api/v1/boards/`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        boardId: board.boardId,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  it("should delete the board", async () => {
    const board = await generateBoards({}, true);
    const { user: authUser } = await createUser();

    // assign "board:destroy" permission to user
    await createRoleWithPermissions(authUser.userId, ["board:destroy"], {
      roleName: "Board destroyer",
    });

    const response = await supertest(app)
      .delete(`/api/v1/boards/`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        boardId: board.boardId,
      });

    expect(response.status).toBe(204);
    expect(response.body.code).toBeUndefined();
  });
});
