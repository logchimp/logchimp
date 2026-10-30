import { expect, it } from "vitest";
import supertest from "supertest";
import { faker } from "@faker-js/faker";

import app from "../../../src/app";
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
