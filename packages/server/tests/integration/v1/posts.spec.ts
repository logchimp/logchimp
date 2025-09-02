import { describe, it, expect, afterEach } from "vitest";
import supertest from "supertest";
import { v4 as uuid } from "uuid";
import { faker } from "@faker-js/faker";
import app from "../../../src/app";
import database from "../../../src/database";
import { board as generateBoards } from "../../utils/generators";
import { createUser } from "../../utils/seed/user";
import { cleanDb } from "../../utils/db";

// Create new posts
describe("POST /api/v1/posts", () => {
  afterEach(async () => {
    await cleanDb();
  });

  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    await cleanDb();
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

    // assign "post:create" permission to user
    const newRoleId = uuid();

    await database.transaction(async (trx) => {
      await trx
        .insert({
          id: newRoleId,
          name: "post:create",
          description: "this role has 'post:create' permission",
        })
        .into("roles");

      // find "post:create" permission
      const findPermission = await trx
        .select()
        .from("permissions")
        .where({
          type: "post",
          action: "create",
        })
        .first();

      // assign 'post:create' permission to newly created role
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
      ]),
    );
  });

  it('should throw error "POST_TITLE_MISSING"', async () => {
    const board = generateBoards();
    await database.insert(board).into("boards");

    const { user: authUser } = await createUser({
      isVerified: true,
    });

    // assign "post:create" permission to user
    const newRoleId = uuid();

    await database.transaction(async (trx) => {
      await trx
        .insert({
          id: newRoleId,
          name: "post:create",
          description: "this role has 'post:create' permission",
        })
        .into("roles");

      // find "post:create" permission
      const findPermission = await trx
        .select()
        .from("permissions")
        .where({
          type: "post",
          action: "create",
        })
        .first();

      // assign 'post:create' permission to newly created role
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
      ]),
    );
  });

  it("should create a post", async () => {
    const board = generateBoards();
    await database.insert(board).into("boards");

    const { user: authUser } = await createUser({
      isVerified: true,
    });

    // assign "post:create" permission to user
    const newRoleId = uuid();

    await database.transaction(async (trx) => {
      await trx
        .insert({
          id: newRoleId,
          name: "post:create",
          description: "this role has 'post:create' permission",
        })
        .into("roles");

      // find "post:create" permission
      const findPermission = await trx
        .select()
        .from("permissions")
        .where({
          type: "post",
          action: "create",
        })
        .first();

      // assign 'post:create' permission to newly created role
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
      .post(`/api/v1/posts/`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        title: faker.food.dish,
        contentMarkdown: faker.food.description,
        userId: authUser.userId,
        boardId: board.boardId,
      });

    expect(response.status).toBe(204);
    expect(response.body.code).toBeUndefined();
  });
});
