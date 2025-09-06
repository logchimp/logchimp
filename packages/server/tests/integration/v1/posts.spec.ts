import { describe, it, expect } from "vitest";
import supertest from "supertest";
import { faker } from "@faker-js/faker";

import app from "../../../src/app";
import { createUser } from "../../utils/seed/user";
import {
  board as generateBoard,
  roadmap as generateRoadmap,
  post as generatePost,
} from "../../utils/generators";
import { createRoleWithPermissions } from "../../utils/createRoleWithPermissions";
import database from "../../../src/database";

// Create new posts
describe("POST /api/v1/posts", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).post("/api/v1/posts");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw error not having 'post:create' permission", async () => {
    const { user: authUser } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .post("/api/v1/boards")
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
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
    const board = await generateBoard({}, true);
    await generateRoadmap({}, true);
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

  it("should create a post with '@everyone' role", async () => {
    const board = await generateBoard({}, true);
    const { user: authUser } = await createUser({
      isVerified: true,
    });

    const title = faker.food.dish();
    const contentMarkdown = faker.food.description();
    const response = await supertest(app)
      .post(`/api/v1/posts/`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        title,
        contentMarkdown,
        userId: authUser.userId,
        boardId: board.boardId,
      });

    expect(response.status).toBe(201);
    expect(response.body.code).toBeUndefined();

    const post = response.body.post;
    expect(post.title).toBe(title);
    expect(post.contentMarkdown).toBe(contentMarkdown);
    expect(post.userId).toBe(authUser.userId);
    expect(post.boardId).toBe(board.boardId);
  });
});

describe("POST /api/v1/posts/slug", () => {
  it('should throw error "POST_NOT_FOUND"', async () => {
    const response = await supertest(app).post("/api/v1/posts/slug").send({
      slug: "dolores-ipsa-mKTAvagnq3xaZYaag2pU",
      // only slug is required to get a post
      userId: "",
    });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("POST_NOT_FOUND");
  });

  it("should get post with matching slug", async () => {
    const board = await generateBoard({}, true);
    const roadmap = await generateRoadmap({}, true);
    const { user: authUser } = await createUser({
      isVerified: true,
    });
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
        roadmapId: roadmap.id,
      },
      true,
    );

    const response = await supertest(app).post("/api/v1/posts/slug").send({
      slug: post.slug,
      // only slug is required to get a post
      userId: "",
    });

    const body = response.body.post;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(body.slug).toBe(post.slug);
    expect(body.board.boardId).toBe(board.boardId);
    expect(body.roadmap.id).toBe(roadmap.id);
    expect(body.author.userId).toBe(authUser.userId);
  });
});

describe("POST /api/v1/posts/:post_id/comments", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const board = await generateBoard({}, true);
    const roadmap = await generateRoadmap({}, true);
    const { user: authUser } = await createUser({
      isVerified: true,
    });
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
        roadmapId: roadmap.id,
      },
      true,
    );

    const response = await supertest(app).post(`/api/v1/posts/${post.postId}/comments`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw error 'INVALID_AUTH_HEADER_FORMAT'", async () => {
    const board = await generateBoard({}, true);
    const roadmap = await generateRoadmap({}, true);
    const { user: authUser } = await createUser({
      isVerified: true,
    });
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
        roadmapId: roadmap.id,
      },
      true,
    );

    const response = await supertest(app)
      .post(`/api/v1/posts/${post.postId}/comments`)
      .set("Authorization", `Beare${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER_FORMAT");
  });

  it("should throw error 'LABS_DISABLED'", async () => {
    const board = await generateBoard({}, true);
    const roadmap = await generateRoadmap({}, true);
    const { user: authUser } = await createUser({
      isVerified: true,
    });
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
        roadmapId: roadmap.id,
      },
      true,
    );

    await database
      .update({
        labs: `{"comments": false}`,
      })
      .from("settings");



    const response = await supertest(app)
      .post(`/api/v1/posts/${post.postId}/comments`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        is_internal: Math.random() >= 0.5,
        body: "et blanditiis pariatur sit eveniet aliquid consequuntur sit tenetur alias",
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("LABS_DISABLED");
  });

  it("should create a Comment", async () => {
    const board = await generateBoard({}, true);
    const roadmap = await generateRoadmap({}, true);
    const { user: authUser } = await createUser({
      isVerified: true,
    });
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
        roadmapId: roadmap.id,
      },
      true,
    );

    await database
      .update({
        labs: `{"comments": true}`,
      })
      .from("settings");

    const commentRequest = {
      is_internal: Math.random() >= 0.5,
      body: "et blanditiis pariatur sit eveniet aliquid consequuntur sit tenetur alias",
    };

    const response = await supertest(app)
      .post(`/api/v1/posts/${post.postId}/comments`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send(commentRequest);

    const responseBody = response.body.comment;

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(201);
    expect(responseBody.author.userId).toBe(authUser.userId);
    expect(responseBody.comment.body).toBe(commentRequest.body);
    expect(responseBody.comment.is_internal).toBe(commentRequest.is_internal);
  });
});
