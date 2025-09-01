import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import { v4 as uuid } from "uuid";
import { faker } from "@faker-js/faker";

import app from "../../../src/app";
import database from "../../../src/database";
import { board as generateBoards } from "../../utils/generators";
import { createUser } from "../../utils/seed/user";
import { IBoard } from "@logchimp/types";
import { TableInserts } from "../../../vitest.setup.integration";
import { createRoleWithPermissions } from "../../utils/createRoleWithPermissions";

declare global {
  var tableInserts: TableInserts[];
}

// Get all boards by filter
describe("GET /api/v1/boards", async () => {
  beforeAll( async () => {
    const response = await supertest(app).get("/api/v1/boards");

    const reponseBoards: IBoard[] = response.body.boards;

    if (reponseBoards.length < 11) {
      const insertsToAdd: TableInserts[] = [];
      await database.transaction(async (trx) => {
        for (let i = 0; i < 15; i++) {
          const board = generateBoards();
          const boardName = faker.commerce.product().toLowerCase();
          board.url = boardName + uuid();

          await trx.insert(board).into("boards");

          insertsToAdd.push({
            tableName: "boards",
            columnName: "boardId",
            uniqueValue: board.boardId
          });

        }
      });
      globalThis.tableInserts.push(...insertsToAdd);
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
      (board: IBoard) => new Date(board.createdAt)
    );

    for (let i = 0; i < boardCreationDates.length - 1; i++) {
      const curr = boardCreationDates[i].getTime();
      const next = boardCreationDates[i+1].getTime();
      expect(curr).to.be.at.most(next);
    }
  });

  it("should get filtered boards in 'DESC' order", async () => {
    const filterQuery = {
      created: 'DESC',
    };

    const response = await supertest(app)
    .get("/api/v1/boards")
    .query(filterQuery);

    const reponseBoards: IBoard[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(reponseBoards).toHaveLength(10);

    const boardCreationDates = reponseBoards.map(
      (board: IBoard) => new Date(board.createdAt)
    );

    for (let i = 0; i < boardCreationDates.length - 1; i++) {
      const curr = boardCreationDates[i].getTime();
      const next = boardCreationDates[i+1].getTime();
      expect(curr).to.be.at.least(next);
    }
  });


  it("should get 2 filtered boards in 'DESC' order", async () => {
    const filterQuery = {
      limit: 2,
      created: 'DESC',
    };

    const response = await supertest(app)
    .get("/api/v1/boards")
    .query(filterQuery);

    const reponseBoards: IBoard[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(reponseBoards).toHaveLength(2);

    const boardCreationDates = reponseBoards.map(
      (board: IBoard) => new Date(board.createdAt)
    );

    for (let i = 0; i < boardCreationDates.length - 1; i++) {
      const curr = boardCreationDates[i].getTime();
      const next = boardCreationDates[i+1].getTime();
      expect(curr).to.be.at.least(next);
    }
  });

  it("should get 10 filtered boards in 'ACS' order", async () => {
    const filterQuery = {
      limit: 15,
      created: 'ACS',
    };

    const response = await supertest(app)
    .get("/api/v1/boards")
    .query(filterQuery);

    const reponseBoards: IBoard[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(reponseBoards).toHaveLength(10);

    const boardCreationDates = reponseBoards.map(
      (board: IBoard) => new Date(board.createdAt)
    );

    for (let i = 0; i < boardCreationDates.length - 1; i++) {
      const curr = boardCreationDates[i].getTime();
      const next = boardCreationDates[i+1].getTime();
      expect(curr).to.be.at.most(next);
    }
  });

  it("should get 5 filtered boards, in page 3, 'DESC' order", async () => {
    const filterQuery = {
      page: 2,
      limit: 5,
      created: 'DESC',
    };

    const response = await supertest(app)
    .get("/api/v1/boards")
    .query(filterQuery);

    const reponseBoards: IBoard[] = response.body.boards;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(reponseBoards).toHaveLength(5);

    const boardCreationDates = reponseBoards.map(
      (board: IBoard) => new Date(board.createdAt)
    );

    for (let i = 0; i < boardCreationDates.length - 1; i++) {
      const curr = boardCreationDates[i].getTime();
      const next = boardCreationDates[i+1].getTime();
      expect(curr).to.be.at.least(next);
    }
  });

  it("should get an empty boards Array", async () => {
    const filterQuery = {
      page: 50,
      limit: 10,
      created: 'DESC',
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
    // generate & add board
    const board = generateBoards();
    const boardName = faker.commerce.product().toLowerCase();
    board.url = boardName;

    const { updatedAt, ...boardCheck } = board;

    await database.insert(board).into("boards");

    globalThis.tableInserts.push({
      tableName: "boards",
      columnName: "boardId",
      uniqueValue: board.boardId
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

// Search board by name
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

  it("should return 0 boards", async () => {
    const { user: authUser } = await createUser();

    // assign "board:read" permission to user
    const newRoleId = uuid();

    await database.transaction(async (trx) => {
      await trx
        .insert({
          id: newRoleId,
          name: "board:read",
          description: "this role has 'board:read' permission",
        })
        .into("roles");

      // find "board:read" permission
      const findPermission = await trx
        .select()
        .from("permissions")
        .where({
          type: "board",
          action: "read",
        })
        .first();

      // assign 'board:read' permission to newly created role
      await trx
        .insert({
          id: uuid(),
          role_id: newRoleId,
          permission_id: findPermission.id,
        })
        .into("permissions_roles");

      // assign the role to newly created user
      await trx
        .insert({
          id: uuid(),
          role_id: newRoleId,
          user_id: authUser.userId,
        })
        .into("roles_users");
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
    expect(response.body.code).toEqual("INVALID_AUTH_HEADER");
  });

  it("should throw error not having 'board:create' permission", async () => {
    const { user: authUser } = await createUser();

    const response = await supertest(app)
      .post("/api/v1/boards")
      .set("Authorization", `Bearer ${authUser.authToken}`);

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

// Delete boards by id
describe("DELETE /api/v1/boards", () => {
  it("should throw error 'NOT_ENOUGH_PERMISSION'", async () => {
    const board = generateBoards();

    await database.insert(board).into("boards");

    globalThis.tableInserts.push({
      tableName: "boards",
      columnName: "boardId",
      uniqueValue: board.boardId
    });

    const { user: authUser } = await createUser();

    const response = await supertest(app)
      .delete(`/api/v1/boards/`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        boardId: board.boardId,
      });

    expect(response.status).toBe(403);
    expect(response.body.code).toEqual("NOT_ENOUGH_PERMISSION");
  });

  it("should delete the board", async () => {
    const board = generateBoards();

    await database.insert(board).into("boards");

    globalThis.tableInserts.push({
      tableName: "boards",
      columnName: "boardId",
      uniqueValue: board.boardId
    });

    const { user: authUser } = await createUser();

    await createRoleWithPermissions(authUser.userId, ["board:destroy"], {
      roleName: "Board Destroyer",
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
