import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import type { IBoardDetail } from "@logchimp/types";
import { faker } from "@faker-js/faker";

import app from "../../../src/app";
import database from "../../../src/database";
import {
  type BoardInsertRecord,
  board as generateBoards,
} from "../../utils/generators";
import { createUser } from "../../utils/seed/user";
import { createRoleWithPermissions } from "../../utils/createRoleWithPermissions";

// Get all boards
describe("GET /api/v1/boards", () => {
  beforeAll(async () => {
    const requiredBoards = 20;
    const existingBoardsCountResult = await database("boards")
      .count({ count: "*" })
      .first();
    const existingBoardsCount = Number.parseInt(
      existingBoardsCountResult?.count?.toString() || "0",
      10,
    );

    if (existingBoardsCount < requiredBoards) {
      const boards: BoardInsertRecord[] = [];
      const trx = await database.transaction();

      for (let i = 0; i < requiredBoards; i++) {
        const board = await generateBoards(
          {
            display: true,
          },
          false,
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

  describe("Offset pagination", () => {
    describe("'?page=' param", () => {
      it("should coerce page=0 and page=-1 to page=1 in offset mode", async () => {
        const page0 = await supertest(app)
          .get("/api/v1/boards")
          .query({ first: 5, page: 0, created: "ASC" });

        const pageNeg1 = await supertest(app)
          .get("/api/v1/boards")
          .query({ first: 5, page: -1, created: "ASC" });

        const page1 = await supertest(app)
          .get("/api/v1/boards")
          .query({ first: 5, page: 1, created: "ASC" });

        const ids0 = page0.body.boards.map((b: IBoardDetail) => b.boardId);
        const idsNeg1 = pageNeg1.body.boards.map(
          (b: IBoardDetail) => b.boardId,
        );
        const ids1 = page1.body.boards.map((b: IBoardDetail) => b.boardId);

        expect(ids0).toEqual(ids1);
        expect(idsNeg1).toEqual(ids1);
      });

      it("should get an empty boards Array for large '?page=1000'", async () => {
        const response = await supertest(app).get("/api/v1/boards").query({
          page: 1000,
          created: "DESC",
        });

        const responseBoards: IBoardDetail[] = response.body.boards;

        expect(response.headers["content-type"]).toContain("application/json");
        expect(response.status).toBe(200);
        expect(responseBoards).toHaveLength(0);
      });
    });

    describe("'?created=' param", () => {
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
    });

    describe("'?limit=' param", () => {
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

      it("should get 15 boards, fallback to cap value of 10 boards in 'ACS' order", async () => {
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
    });
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
  ].map((name) =>
    it(`should throw error "BOARD_NOT_FOUND" for '${name}'`, async () => {
      const res = await supertest(app).get(`/api/v1/boards/${name}`);
      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.status).toBe(404);
      expect(res.body.code).toBe("BOARD_NOT_FOUND");
    }),
  );

  ["*&^(*&$%&*^&%&^%*"].map((name) =>
    it(`should throw error "DECODE_URI_ERROR" for '${name}' board`, async () => {
      const res = await supertest(app).get(`/api/v1/boards/${name}`);
      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.status).toBe(400);
      expect(res.body.code).toBe("DECODE_URI_ERROR");
    }),
  );

  it("should get board by url", async () => {
    const board: BoardInsertRecord = await generateBoards({}, true);
    const { updatedAt, ...boardCheck } = board;

    const response = await supertest(app).get(`/api/v1/boards/${board.url}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);

    expect(response.body.board).toStrictEqual({
      ...boardCheck,
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

  ["*&^(*&$%&*^&%&^%*"].map((name) =>
    it(`should return 0 search results for '${name}' boards`, async () => {
      const { user: authUser } = await createUser();
      await createRoleWithPermissions(authUser.userId, ["board:read"], {
        roleName: "Board Reader",
      });

      const response = await supertest(app)
        .get(`/api/v1/boards/search/${name}`)
        .set("Authorization", `Bearer ${authUser.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(400);
      expect(response.body.code).toBe("DECODE_URI_ERROR");
    }),
  );

  const boardName = faker.commerce
    .productName()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .substring(0, 50)
    .replace(/^-+|-+$/g, "");
  it(`should show 2 "${boardName}" matching boards`, async () => {
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

    expect(boards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          boardId: board1.boardId,
          name: board1.name,
          url: board1.url,
          color: board1.color,
          display: board1.display,
        }),
        expect.objectContaining({
          boardId: board2.boardId,
          name: board2.name,
          url: board2.url,
          color: board2.color,
          display: board2.display,
        }),
      ]),
    );
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

  it("should throw error 'INVALID_AUTH_HEADER_FORMAT'", async () => {
    const { user: authUser } = await createUser();

    const response = await supertest(app)
      .post("/api/v1/boards")
      .set("Authorization", `Beare${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER_FORMAT");
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

  it("should create a board", async () => {
    const board: BoardInsertRecord = await generateBoards({}, false);
    const { user: authUser } = await createUser();

    await createRoleWithPermissions(authUser.userId, ["board:create"], {
      roleName: "Board Creator",
    });

    const response = await supertest(app)
      .post(`/api/v1/boards/`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        name: board.name,
        display: board.display,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(201);
    const boardResponse = response.body.board;
    expect(boardResponse.name).toBe(board.name);
    expect(boardResponse.display).toBe(board.display);
  });

  it("should create a board without a name", async () => {
    const { user: authUser } = await createUser();
    const display = Math.random() >= 0.5;

    await createRoleWithPermissions(authUser.userId, ["board:create"], {
      roleName: "Board Creator",
    });

    const response = await supertest(app)
      .post(`/api/v1/boards/`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        display,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(201);
    const boardResponse = response.body.board;
    expect(boardResponse.name).toBe("new board");
    expect(boardResponse.display).toBe(display);
  });
});

describe("PATCH /api/v1/boards", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).patch("/api/v1/boards");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw error 'INVALID_AUTH_HEADER_FORMAT'", async () => {
    const { user: authUser } = await createUser();

    const response = await supertest(app)
      .patch("/api/v1/boards")
      .set("Authorization", `Beare${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER_FORMAT");
  });

  it("should throw error 'BOARD_NOT_FOUND'", async () => {
    const { user: authUser } = await createUser();

    await createRoleWithPermissions(authUser.userId, ["board:update"], {
      roleName: "Board Patcher",
    });

    const response = await supertest(app)
      .patch("/api/v1/boards")
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        boardId: faker.string.uuid(),
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("BOARD_NOT_FOUND");
  });

  it("should throw error not having 'board:update' permission", async () => {
    const board: BoardInsertRecord = await generateBoards({}, true);
    const { user: authUser } = await createUser();

    const response = await supertest(app)
      .patch("/api/v1/boards")
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        boardId: board.boardId,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  it("should throw error 'BOARD_URL_MISSING'", async () => {
    const board: BoardInsertRecord = await generateBoards({}, true);
    const newBoard: BoardInsertRecord = await generateBoards({}, false);
    const { user: authUser } = await createUser();

    await createRoleWithPermissions(authUser.userId, ["board:update"], {
      roleName: "Board Patcher",
    });

    const response = await supertest(app)
      .patch("/api/v1/boards")
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        boardId: board.boardId,
        name: newBoard.name,
        color: newBoard.color,
        view_voters: newBoard.view_voters,
        display: newBoard.display,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Board url cannot be empty",
          code: "BOARD_URL_MISSING",
        }),
      ]),
    );
  });

  it("should throw error 'BOARD_URL_EXISTS'", async () => {
    const { user: authUser } = await createUser();

    const preExistingBoard = await generateBoards({}, true);
    const board = await generateBoards({}, true);

    await createRoleWithPermissions(authUser.userId, ["board:update"], {
      roleName: "Board Patcher",
    });

    const response = await supertest(app)
      .patch("/api/v1/boards")
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        boardId: board.boardId,
        url: preExistingBoard.url,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(409);
    expect(response.body.code).toBe("BOARD_URL_EXISTS");
  });

  it("should UPDATE board", async () => {
    const board: BoardInsertRecord = await generateBoards({}, true);
    const newBoard: BoardInsertRecord = await generateBoards({}, false);
    const { user: authUser } = await createUser();

    await createRoleWithPermissions(authUser.userId, ["board:update"], {
      roleName: "Board Patcher",
    });

    const response = await supertest(app)
      .patch("/api/v1/boards")
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        boardId: board.boardId,
        url: newBoard.url,
        name: newBoard.name,
        color: newBoard.color,
        view_voters: newBoard.view_voters,
        display: newBoard.display,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);

    const responseBoard = response.body.board;
    expect(responseBoard.boardId).toBe(board.boardId);
    expect(responseBoard.url).toBe(newBoard.url.toLowerCase());
    expect(responseBoard.name).toBe(newBoard.name);
    expect(responseBoard.color).toBe(newBoard.color);
    expect(responseBoard.view_voters).toBe(newBoard.view_voters);
    expect(responseBoard.display).toBe(newBoard.display);
  });
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

// Check if a boardUrl exists
describe("POST /api/v1/boards/check-slug", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).post("/api/v1/boards/check-slug");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw error 'INVALID_AUTH_HEADER_FORMAT'", async () => {
    const { user: authUser } = await createUser();

    const response = await supertest(app)
      .post("/api/v1/boards/check-slug")
      .set("Authorization", `Beare${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER_FORMAT");
  });

  it("should throw error 'NOT_ENOUGH_PERMISSION'", async () => {
    const { user: authUser } = await createUser();

    const response = await supertest(app)
      .post("/api/v1/boards/check-slug")
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  it("should throw error 'BOARD_URL_MISSING'", async () => {
    const { user: authUser } = await createUser();

    await createRoleWithPermissions(
      authUser.userId,
      ["board:create", "board:update"],
      {
        roleName: "Board contributor",
      },
    );

    const response = await supertest(app)
      .post("/api/v1/boards/check-slug")
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("BOARD_URL_MISSING");
  });

  it("should return '{ available: false}' for board url that already exists", async () => {
    const { user: authUser } = await createUser();

    await createRoleWithPermissions(
      authUser.userId,
      ["board:create", "board:update"],
      {
        roleName: "Board contributor",
      },
    );

    const board = await generateBoards({}, true);
    console.log(board.url);
    const response = await supertest(app)
      .post("/api/v1/boards/check-slug")
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        url: board.url,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.available).toBeFalsy();
  });

  it.skip("should return '{ available: true}' for board url that doesn't exists", async () => {
    const { user: authUser } = await createUser();

    await createRoleWithPermissions(
      authUser.userId,
      ["board:create", "board:update"],
      {
        roleName: "Board contributor",
      },
    );

    const response = await supertest(app)
      .post("/api/v1/boards/check-slug")
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        url: faker.food.dish(),
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.available).toBeTruthy();
  });
});
