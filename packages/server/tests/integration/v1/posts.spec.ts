import { describe, it, expect, afterEach } from "vitest";
import supertest from "supertest";
import app from "../../../src/app";
import database from "../../../src/database";
import {
  post as generatePost,
  board as generateBoards,
  roadmap as generateRoadmap
} from "../../utils/generators";
import { createUser } from "../../utils/seed/user";
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
    const board = generateBoards();
    await database.insert(board).into("boards");

    const roadmap = generateRoadmap();
    await database.insert(roadmap).into("roadmaps");

    const { user: authUser } = await createUser({
      isVerified: true,
    });

    const post = generatePost({
      user_id: authUser.userId,
      board_id: board.boardId,
      roadmap_id: roadmap.id,
    });

    await database.insert(post).into("posts");

    const response = await supertest(app)
    .post("/api/v1/posts/slug")
    .send(
      {
        slug: post.slug,
        userId: ""
      }
    );

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.post.slug).toEqual(post.slug);
    expect(response.body.post.board.boardId).toEqual(board.boardId);
    expect(response.body.post.roadmap.id).toEqual(roadmap.id);
    expect(response.body.post.author.userId).toEqual(authUser.userId);
  });
});
