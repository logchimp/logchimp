import { expect, it } from "vitest";
import supertest from "supertest";
import { faker } from "@faker-js/faker";

import app from "../../../src/app";
import * as cache from "../../../src/cache";
import { createUser } from "../../utils/seed/user";
import { board as generateBoard } from "../../utils/generators";
import { createRoleWithPermissions } from "../../utils/createRoleWithPermissions";
import { describeEE } from "../../utils/skipEE";

// Create new posts
describeEE("POST /api/v1/posts", () => {
  it("should create a post without title", async () => {
    const board = await generateBoard({}, true);
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
    expect(response.status).toBe(201);
    const postResponse = response.body.post;
    expect(postResponse.title).toBe("new post");
    expect(postResponse.boardId).toBe(board.boardId);
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

describeEE("Board cache invalidation", () => {
  it.skipIf(!cache.isActive)(
    "should invalidate the board cache after creating a post",
    async () => {
      const board = await generateBoard({}, true);
      const { user: authUser } = await createUser({ isVerified: true });

      const cacheKey = `board:private:${board.boardId}`;
      await cache.valkey.set(
        cacheKey,
        JSON.stringify({ boardId: board.boardId, post_count: 0 }),
      );

      const response = await supertest(app)
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authUser.authToken}`)
        .send({
          title: faker.food.dish(),
          contentMarkdown: faker.food.description(),
          boardId: board.boardId,
        });

      expect(response.status).toBe(201);
      expect(response.body.post.boardId).toBe(board.boardId);
      expect(await cache.valkey.get(cacheKey)).toBeNull();
    },
  );

  it.skipIf(!cache.isActive)(
    "should invalidate both boards after a post moves between boards",
    async () => {
      const previousBoard = await generateBoard({}, true);
      const newBoard = await generateBoard({}, true);
      const { user: author } = await createUser({ isVerified: true });

      const createResponse = await supertest(app)
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${author.authToken}`)
        .send({
          title: faker.food.dish(),
          contentMarkdown: faker.food.description(),
          boardId: previousBoard.boardId,
        });

      expect(createResponse.status).toBe(201);
      const post = createResponse.body.post;

      const previousBoardKey = `board:private:${previousBoard.boardId}`;
      const newBoardKey = `board:private:${newBoard.boardId}`;
      await cache.valkey.set(previousBoardKey, "{}");
      await cache.valkey.set(newBoardKey, "{}");

      const response = await supertest(app)
        .patch("/api/v1/posts")
        .set("Authorization", `Bearer ${author.authToken}`)
        .send({
          id: post.postId,
          title: post.title,
          boardId: newBoard.boardId,
        });

      expect(response.status).toBe(200);
      expect(response.body.post.boardId).toBe(newBoard.boardId);
      expect(await cache.valkey.get(previousBoardKey)).toBeNull();
      expect(await cache.valkey.get(newBoardKey)).toBeNull();
    },
  );
});
