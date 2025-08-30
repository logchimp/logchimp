import { describe, it, expect, afterEach } from "vitest";
import supertest from "supertest";
import app from "../../../src/app";
import { createUser } from "../../utils/seed/user";
import { createBoard } from "../../utils/seed/board";
import { createRoadmap } from "../../utils/seed/roadmap";
import { createPost } from "../../utils/seed/post";
import { cleanDb } from "../../utils/db";

describe("POST Slug /api/v1/posts/slug", () => {
  afterEach(async () => {
    await cleanDb();
  });

  it('should throw error "POST_NOT_FOUND"', async () => {
    await cleanDb();

    const response = await supertest(app)
    .post("/api/v1/posts/slug")
    .send(
      {
        slug: "dolores-ipsa-mKTAvagnq3xaZYaag2pU",
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
