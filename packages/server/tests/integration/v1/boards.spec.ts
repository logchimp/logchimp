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
import { createRoleWithPermissions } from "../../utils/createRoleWithPermissions";

declare global {
  var tableInserts: TableInserts[];
}

// Get all boards by filter
describe("GET /api/v1/boards", () => {
  beforeAll(async () => {
    // Ensure database has at least 15 boards for testing pagination and limits.
    const requiredBoards = 15;
    const existingBoardsCountResult = await database("boards").count({ count: '*' }).first();
    const existingBoardsCount = parseInt(existingBoardsCountResult?.count?.toString() || "0", 10);

    if (existingBoardsCount < requiredBoards) {
      console.log(`Seeding database: Found ${existingBoardsCount} boards, requiring ${requiredBoards}.`);
      const boards: any[] = [];
      const trx = await database.transaction();

      try {
        for (let i = 0; i < requiredBoards; i++) {
          const board = generateBoards();
          const boardName = faker.commerce.product().toLowerCase();
          board.url = `${boardName}-${uuid()}`; // Ensure unique URLs
          boards.push(board);

          globalThis.tableInserts.push({
            tableName: "boards",
            columnName: "boardId",
            uniqueValue: board.boardId,
          });
        }

        await database.batchInsert("boards", boards).transacting(trx);
        await trx.commit();
        console.log(`Successfully seeded ${requiredBoards} boards.`);
      } catch (error) {
        await trx.rollback();
        console.error("Error during database seeding:", error);
        throw error; // Re-throw to fail the setup
      }
    } else {
      console.log(`Database already has ${existingBoardsCount} boards. Skipping seeding.`);
    }
  });

  it("should get an Array of boards", async () => {
    console.log("--- Starting test: GET /api/v1/boards > should get an Array of boards ---");
    const response = await supertest(app).get("/api/v1/boards");
    console.log(`API Response Status for 'should get an Array of boards': ${response.status}`);
    console.log(`API Response Body for 'should get an Array of boards':`, response.body);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.boards).toBeInstanceOf(Array);
  });

  it("should get filtered boards in defualt filter values", async () => {
    console.log("--- Starting test: GET /api/v1/boards > should get filtered boards in defualt filter values ---");
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
    console.log(`API Response Status for 'should get filtered boards in defualt filter values': ${response.status}`);
    console.log(`API Response Body length for 'should get filtered boards in defualt filter values': ${response.body.boards.length}`);


    const reponseBoards: IBoard[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(reponseBoards).toHaveLength(10); // This is likely the assertion that fails

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
    console.log("--- Starting test: GET /api/v1/boards > should get filtered boards in 'DESC' order ---");
    const filterQuery = {
      created: "DESC",
    };

    const response = await supertest(app)
      .get("/api/v1/boards")
      .query(filterQuery);
    console.log(`API Response Status for 'should get filtered boards in 'DESC' order': ${response.status}`);
    console.log(`API Response Body length for 'should get filtered boards in 'DESC' order': ${response.body.boards.length}`);

    const reponseBoards: IBoard[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(reponseBoards).toHaveLength(10); // This is likely the assertion that fails

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
    console.log("--- Starting test: GET /api/v1/boards > should get 2 filtered boards in 'DESC' order ---");
    const filterQuery = {
      limit: 2,
      created: "DESC",
    };

    const response = await supertest(app)
      .get("/api/v1/boards")
      .query(filterQuery);
    console.log(`API Response Status for 'should get 2 filtered boards in 'DESC' order': ${response.status}`);
    console.log(`API Response Body length for 'should get 2 filtered boards in 'DESC' order': ${response.body.boards.length}`);

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
    console.log("--- Starting test: GET /api/v1/boards > should get 10 filtered boards in 'ACS' order ---");
    const filterQuery = {
      limit: 15, // Note: This limit is 15, but the test expects 10 results.
      created: "ACS",
    };

    const response = await supertest(app)
      .get("/api/v1/boards")
      .query(filterQuery);
    console.log(`API Response Status for 'should get 10 filtered boards in 'ACS' order': ${response.status}`);
    console.log(`API Response Body length for 'should get 10 filtered boards in 'ACS' order': ${response.body.boards.length}`);

    const reponseBoards: IBoard[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(reponseBoards).toHaveLength(10); // This is likely the assertion that fails

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
    console.log("--- Starting test: GET /api/v1/boards > should get 5 filtered boards, in page 3, 'DESC' order ---");
    const filterQuery = {
      page: 2, // Page 2 means the 3rd page of results (0-indexed)
      limit: 5,
      created: "DESC",
    };

    const response = await supertest(app)
      .get("/api/v1/boards")
      .query(filterQuery);
    console.log(`API Response Status for 'should get 5 filtered boards, in page 3, 'DESC' order': ${response.status}`);
    console.log(`API Response Body length for 'should get 5 filtered boards, in page 3, 'DESC' order': ${response.body.boards.length}`);

    const reponseBoards: IBoard[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(reponseBoards).toHaveLength(5); // This is likely the assertion that fails

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
    console.log("--- Starting test: GET /api/v1/boards > should get an empty boards Array ---");
    const filterQuery = {
      page: 50,
      limit: 10,
      created: "DESC",
    };

    const response = await supertest(app)
      .get("/api/v1/boards")
      .query(filterQuery);
    console.log(`API Response Status for 'should get an empty boards Array': ${response.status}`);
    console.log(`API Response Body length for 'should get an empty boards Array': ${response.body.boards.length}`);

    const reponseBoards: IBoard[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(reponseBoards).toHaveLength(0);
  });
});

// Get boards by URL
describe("GET /boards/:url", () => {
  it('should throw error "BOARD_NOT_FOUND"', async () => {
    console.log("--- Starting test: GET /boards/:url > should throw error 'BOARD_NOT_FOUND' ---");
    const response = await supertest(app).get("/api/v1/boards/do_not_exists");
    console.log(`API Response Status for 'should throw error "BOARD_NOT_FOUND"': ${response.status}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toEqual("BOARD_NOT_FOUND");
  });

  it("should get board by url", async () => {
    console.log("--- Starting test: GET /boards/:url > should get board by url ---");
    // generate & add board
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

    // Duplicate entry in tableInserts is likely unintended, removed one.
    // globalThis.tableInserts.push({
    //   tableName: "boards",
    //   columnName: "boardId",
    //   uniqueValue: board.boardId,
    // });

    const response = await supertest(app).get(`/api/v1/boards/${boardName}`);
    console.log(`API Response Status for 'should get board by url': ${response.status}`);
    console.log(`API Response Body for 'should get board by url':`, response.body);


    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.board).toStrictEqual({
      ...boardCheck,
      post_count: "0", // Assuming post_count is always '0' for a new board without posts
    });
  });
});

// Search board by name
describe("GET /boards/search/:name", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    console.log("--- Starting test: GET /boards/search/:name > should throw error 'INVALID_AUTH_HEADER' ---");
    const response = await supertest(app).get("/api/v1/boards/search/name");
    console.log(`API Response Status for 'should throw error "INVALID_AUTH_HEADER"': ${response.status}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual("INVALID_AUTH_HEADER");
  });

  it("should throw error not having 'board:read' permission", async () => {
    console.log("--- Starting test: GET /boards/search/:name > should throw error not having 'board:read' permission ---");
    const { user: authUser } = await createUser();


    const response = await supertest(app)
      .get("/api/v1/boards/search/name")
      .set("Authorization", `Bearer ${authUser.authToken}`);
    console.log(`API Response Status for 'should throw error not having 'board:read' permission': ${response.status}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toEqual("NOT_ENOUGH_PERMISSION");
  });

});
