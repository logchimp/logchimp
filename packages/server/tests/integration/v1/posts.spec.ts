import { describe, it, expect } from "vitest";
import supertest from "supertest";
import { v4 as uuid } from "uuid";
import { faker } from "@faker-js/faker";
import app from "../../../src/app";
import { createUser } from "../../utils/seed/user";
import { createBoard } from "../../utils/seed/board";
import { createRoadmap } from "../../utils/seed/roadmap";
import { createPost } from "../../utils/seed/post";
import { faker } from "@faker-js/faker";
import database from "../../../src/database";
import { createRoleWithPermissions } from "../../utils/createRoleWithPermissions";

// Create new posts
describe(" POST /api/v1/posts", () => {afterEach(async () => {
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
      ]),
    );
  });

  it('should throw error "POST_TITLE_MISSING"', async () => {
    const board = await createBoard();
    await database.insert(board).into("boards");

    const roadmap = generateRoadmap();
    await database.insert(roadmap).into("roadmaps");

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
      ]),
    );
  });

  it("should create a post", async () => {
    const board = await createBoard();

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
        boardId: board.boardId,
      });

    expect(response.status).toBe(204);
    expect(response.body.code).toBeUndefined();
  });
});

describe("POST /api/v1/posts/slug", () => {
  it('should throw error "POST_NOT_FOUND"', async () => {
    const response = await supertest(app)
      .post("/api/v1/posts/slug")
      .send(
        {
          slug: "dolores-ipsa-mKTAvagnq3xaZYaag2pU",
          // only slug is required to get a post
          userId: ""
        }
      );

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toEqual("POST_NOT_FOUND");
  });

  it('should get post with matching slug', async () => {
    const board = await createBoard();

    const roadmap = await createRoadmap();

    const { user: authUser } = await createUser({
      isVerified: true
    });

    const post = await createPost(
      authUser.userId,
      board.boardId,
      roadmap.id
    );

    const response = await supertest(app)
      .post("/api/v1/posts/slug")
      .send(
        {
          slug: post.slug,
          // only slug is required to get a post
          userId: ""
        }
      );

    const body = response.body.post;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(body.slug).toEqual(post.slug);
    expect(body.board.boardId).toEqual(board.boardId);
    expect(body.roadmap.id).toEqual(roadmap.id);
    expect(body.author.userId).toEqual(authUser.userId);
  });
});
