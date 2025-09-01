import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import type { IBoardDetail } from "@logchimp/types";

import app from "../../../src/app";
import database from "../../../src/database";
import { board as generateBoards } from "../../utils/generators";
import { createUser } from "../../utils/seed/user";
import { createRoleWithPermissions } from "../../utils/createRoleWithPermissions";

describe("GET /api/v1/boards", () => {
  beforeAll(async () => {
    const requiredBoards = 15;
    const existingBoardsCountResult = await database("boards")
      .count({ count: "*" })
      .first();
    const existingBoardsCount = parseInt(
      existingBoardsCountResult?.count?.toString() || "0",
      10,
    );

    if (existingBoardsCount < requiredBoards) {
      const boards: unknown[] = [];
      const trx = await database.transaction();

      for (let i = 0; i < requiredBoards; i++) {
        const board = await generateBoards(
          {
            display: true,
          },
          true,
        );
        boards.push(board);
      }

      await database.batchInsert("boards", boards).transacting(trx);
      await trx.commit();
    }
  });

  it("should get an Array of boards", async () => {
    const response = await supertest(app).get("/api/v1/boards");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.boards).toBeInstanceOf(Array);
  });

  it("should get filtered boards in default filter values", async () => {
    const filterQuery = {
      // default page num is 0
      // page: 0,
      // default and max limit is 10
      // limit: 10,
      // default 'ASC' order
      // created: "ASC",
    };

    const response = await supertest(app)
      .get("/api/v1/boards")
      .query(filterQuery);

    const responseBoards: IBoardDetail[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(responseBoards).toHaveLength(10);

    const boardCreationDates = responseBoards.map(
      (board: IBoardDetail) => new Date(board.createdAt),
    );

    for (let i = 0; i < boardCreationDates.length - 1; i++) {
      const curr = boardCreationDates[i].getTime();
      const next = boardCreationDates[i + 1].getTime();
      expect(curr).to.be.at.most(next);
    }
  });

  it("should get filtered boards in 'DESC' order", async () => {
    const response = await supertest(app).get("/api/v1/boards").query({
      created: "DESC",
    });

    const responseBoards: IBoardDetail[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(responseBoards).toHaveLength(10);

    const boardCreationDates = responseBoards.map(
      (board: IBoardDetail) => new Date(board.createdAt),
    );

    for (let i = 0; i < boardCreationDates.length - 1; i++) {
      const curr = boardCreationDates[i].getTime();
      const next = boardCreationDates[i + 1].getTime();
      expect(curr).to.be.at.least(next);
    }
  });

  it("should get 2 filtered boards in 'DESC' order", async () => {
    const response = await supertest(app).get("/api/v1/boards").query({
      limit: 2,
      created: "DESC",
    });

    const responseBoards: IBoardDetail[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(responseBoards).toHaveLength(2);

    const boardCreationDates = responseBoards.map(
      (board: IBoardDetail) => new Date(board.createdAt),
    );

    for (let i = 0; i < boardCreationDates.length - 1; i++) {
      const curr = boardCreationDates[i].getTime();
      const next = boardCreationDates[i + 1].getTime();
      expect(curr).to.be.at.least(next);
    }
  });

  it("should get 10 filtered boards in 'ACS' order", async () => {
    const response = await supertest(app).get("/api/v1/boards").query({
      limit: 15,
      created: "ACS",
    });

    const responseBoards: IBoardDetail[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(responseBoards).toHaveLength(10);

    const boardCreationDates = responseBoards.map(
      (board: IBoardDetail) => new Date(board.createdAt),
    );

    for (let i = 0; i < boardCreationDates.length - 1; i++) {
      const curr = boardCreationDates[i].getTime();
      const next = boardCreationDates[i + 1].getTime();
      expect(curr).to.be.at.most(next);
    }
  });

  it("should get 5 filtered boards, in page 3, 'DESC' order", async () => {
    const response = await supertest(app).get("/api/v1/boards").query({
      page: 2,
      limit: 5,
      created: "DESC",
    });

    const responseBoards: IBoardDetail[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(responseBoards).toHaveLength(5);

    const boardCreationDates = responseBoards.map(
      (board: IBoardDetail) => new Date(board.createdAt),
    );

    for (let i = 0; i < boardCreationDates.length - 1; i++) {
      const curr = boardCreationDates[i].getTime();
      const next = boardCreationDates[i + 1].getTime();
      expect(curr).to.be.at.least(next);
    }
  });

  it("should get an empty boards Array", async () => {
    const response = await supertest(app).get("/api/v1/boards").query({
      page: 50,
      limit: 10,
      created: "DESC",
    });

    const responseBoards: IBoardDetail[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(responseBoards).toHaveLength(0);
  });
});

// Get boards by URL
describe("GET /boards/:url", () => {
  it('should throw error "BOARD_NOT_FOUND"', async () => {
    const response = await supertest(app).get("/api/v1/boards/do_not_exists");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("BOARD_NOT_FOUND");
  });

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

  it("should return 0 boards", async () => {
    const { user: authUser } = await createUser();

    // assign "board:read" permission to user
    await createRoleWithPermissions(authUser.userId, ["board:read"], {
      roleName: "Board Reader",
    });
    const response = await supertest(app)
      .get("/api/v1/boards/search/name")
      .set("Authorization", `Bearer ${authUser.authToken}`);

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
