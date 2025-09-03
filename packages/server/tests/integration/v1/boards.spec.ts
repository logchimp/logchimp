// packages/server/tests/integration/v1/boards.spec.ts
import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import { v4 as uuid } from "uuid";
import { faker } from "@faker-js/faker";

import app from "../../../src/app";
import database from "../../../src/database";
import { board as generateBoards } from "../../utils/generators";
import { createUser } from "../../utils/seed/user";
import type { IBoard } from "@logchimp/types";
import type { TableInserts } from "../../../vitest.setup.integration";

declare global {
  var tableInserts: TableInserts[];
}

// Get all boards by filter
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
      const boards: any[] = [];
      const trx = await database.transaction();

      for (let i = 0; i < requiredBoards; i++) {
        const board = generateBoards();
        const boardName = faker.commerce.product().toLowerCase();
        board.url = `${boardName}-${uuid()}`;
        board.display = true;

        boards.push(board);

        globalThis.tableInserts.push({
          tableName: "boards",
          columnName: "boardId",
          uniqueValue: board.boardId,
        });
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

  it("should get filtered boards in defualt filter values", async () => {
    const filterQuery = {
      // default page num is 0
      // page: 0,
      // default and max limit is 10
      // limit: 10,
      // defualt 'ASC' order
      // created: "ASC",
    };

    const response = await supertest(app)
      .get("/api/v1/boards")
      .query(filterQuery);

    const reponseBoards: IBoard[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(reponseBoards).toHaveLength(10);

    const boardCreationDates = reponseBoards.map(
      (board: IBoard) => new Date(board.createdAt),
    );

    for (let i = 0; i < boardCreationDates.length - 1; i++) {
      const curr = boardCreationDates[i].getTime();
      const next = boardCreationDates[i + 1].getTime();
      expect(curr).to.be.at.most(next);
    }
  });

  it("should get filtered boards in 'DESC' order", async () => {
    const filterQuery = {
      created: "DESC",
    };

    const response = await supertest(app)
      .get("/api/v1/boards")
      .query(filterQuery);

    const reponseBoards: IBoard[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(reponseBoards).toHaveLength(10);

    const boardCreationDates = reponseBoards.map(
      (board: IBoard) => new Date(board.createdAt),
    );

    for (let i = 0; i < boardCreationDates.length - 1; i++) {
      const curr = boardCreationDates[i].getTime();
      const next = boardCreationDates[i + 1].getTime();
      expect(curr).to.be.at.least(next);
    }
  });

  it("should get 2 filtered boards in 'DESC' order", async () => {
    const filterQuery = {
      limit: 2,
      created: "DESC",
    };

    const response = await supertest(app)
      .get("/api/v1/boards")
      .query(filterQuery);

    const reponseBoards: IBoard[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(reponseBoards).toHaveLength(2);

    const boardCreationDates = reponseBoards.map(
      (board: IBoard) => new Date(board.createdAt),
    );

    for (let i = 0; i < boardCreationDates.length - 1; i++) {
      const curr = boardCreationDates[i].getTime();
      const next = boardCreationDates[i + 1].getTime();
      expect(curr).to.be.at.least(next);
    }
  });

  it("should get 10 filtered boards in 'ACS' order", async () => {
    const filterQuery = {
      limit: 15,
      created: "ACS",
    };

    const response = await supertest(app)
      .get("/api/v1/boards")
      .query(filterQuery);

    const reponseBoards: IBoard[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(reponseBoards).toHaveLength(10);

    const boardCreationDates = reponseBoards.map(
      (board: IBoard) => new Date(board.createdAt),
    );

    for (let i = 0; i < boardCreationDates.length - 1; i++) {
      const curr = boardCreationDates[i].getTime();
      const next = boardCreationDates[i + 1].getTime();
      expect(curr).to.be.at.most(next);
    }
  });

  it("should get 5 filtered boards, in page 3, 'DESC' order", async () => {
    const filterQuery = {
      page: 2,
      limit: 5,
      created: "DESC",
    };

    const response = await supertest(app)
      .get("/api/v1/boards")
      .query(filterQuery);

    const reponseBoards: IBoard[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(reponseBoards).toHaveLength(5);

    const boardCreationDates = reponseBoards.map(
      (board: IBoard) => new Date(board.createdAt),
    );

    for (let i = 0; i < boardCreationDates.length - 1; i++) {
      const curr = boardCreationDates[i].getTime();
      const next = boardCreationDates[i + 1].getTime();
      expect(curr).to.be.at.least(next);
    }
  });

  it("should get an empty boards Array", async () => {
    const filterQuery = {
      page: 50,
      limit: 10,
      created: "DESC",
    };

    const response = await supertest(app)
      .get("/api/v1/boards")
      .query(filterQuery);

    const reponseBoards: IBoard[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(reponseBoards).toHaveLength(0);
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
    const board = generateBoards();
    const boardName = faker.commerce.product().toLowerCase();
    board.url = boardName;

    const { updatedAt, ...boardCheck } = board;

    await database.insert(board).into("boards");

    globalThis.tableInserts.push({
      tableName: "boards",
      columnName: "boardId",
      uniqueValue: board.boardId,
    });

    const response = await supertest(app).get(`/api/v1/boards/${boardName}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.board).toStrictEqual({
      ...boardCheck,
      post_count: "0",
    });
  });
});

describe("GET /boards/search/:name", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).get("/api/v1/boards/search/name");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual("INVALID_AUTH_HEADER");
  });

  it("should throw error not having 'board:read' permission", async () => {
    const { user: authUser } = await createUser();

    const response = await supertest(app)
      .get("/api/v1/boards/search/name")
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toEqual("NOT_ENOUGH_PERMISSION");
  });
});
