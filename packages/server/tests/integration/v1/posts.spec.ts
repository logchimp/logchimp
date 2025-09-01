import { describe, it, expect, afterEach } from "vitest";
import supertest from "supertest";
import { faker } from "@faker-js/faker";
import app from "../../../src/app";
import database from "../../../src/database";
import {
  board as generateBoards,
} from "../../utils/generators";
import { createUser } from "../../utils/seed/user";
import { cleanDb } from "../../utils/db";
import { createRoleWithPermissions } from "../../utils/createRoleWithPermissions";

// Create new posts
describe("CREATE POST /api/v1/posts", () => {

  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).post("/api/v1/posts");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual("INVALID_AUTH_HEADER");
  });

  it('should throw error "NOT_ENOUGH_PERMISSION"', async () => {
    const { user: authUser } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .post("/api/v1/boards")
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toEqual("NOT_ENOUGH_PERMISSION");
  });

  it('should throw error "BOARD_ID_MISSING"', async () => {
    const { user: authUser } = await createUser({
      isVerified: true,
    });

    await createRoleWithPermissions(authUser.userId, ["post:create"], {
      roleName: "Post Creator",
    });

    const response = await supertest(app)
      .post(`/api/v1/posts/`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        title: faker.food.dish,
        contentMarkdown: faker.food.description,
        userId: authUser.userId,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Board ID missing",
          code: "BOARD_ID_MISSING",
        }),
      ])
    );
  });

  it('should throw error "POST_TITLE_MISSING"', async () => {
    const board = generateBoards();
    await database.insert(board).into("boards");

    const { user: authUser } = await createUser({
      isVerified: true,
    });

    await createRoleWithPermissions(authUser.userId, ["post:create"], {
      roleName: "Post Creator",
    });

    const response = await supertest(app)
      .post(`/api/v1/posts/`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        contentMarkdown: faker.food.description,
        userId: authUser.userId,
        boardId: board.boardId,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Post title missing",
          code: "POST_TITLE_MISSING",
        }),
      ])
    );
  });

  it("should create a post", async () => {
    const board = generateBoards();
    await database.insert(board).into("boards");

    const { user: authUser } = await createUser({
      isVerified: true,
    });

    await createRoleWithPermissions(authUser.userId, ["post:create"], {
      roleName: "Post Creator",
    });

    const response = await supertest(app)
      .post(`/api/v1/posts/`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        title: faker.food.dish(),
        contentMarkdown: faker.food.description(),
        userId: authUser.userId,
        boardId: board.boardId,
      });

    console.log(response.body);

    expect(response.status).toBe(201);
    expect(response.body.code).toBeUndefined();
  });
});
