import { describe, it, expect } from "vitest";
import supertest from "supertest";
import { v4 as uuid } from "uuid";
import app from "../../../src/app";
import { createUser } from "../../utils/seed/user";
import { cleanDb } from "../../utils/db";
import { post as generatePost } from "../../utils/generators";

// Add vote to post
describe("POST /api/v1/votes", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    await cleanDb();
    const response = await supertest(app).post("/api/v1/votes");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual("INVALID_AUTH_HEADER");
  });

  // TODO: work on it
  it.skip("should throw error \"NOT_ENOUGH_PERMISSION\" for user without 'vote:create' permission", async () => {
    const { user: authUser } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .post("/api/v1/votes")
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        postId: uuid(),
      });

    console.log("res:", response.body);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toEqual("NOT_ENOUGH_PERMISSION");
  });

  it('should throw error "INVALID_POST_ID"', async () => {
    const { user } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .post(`/api/v1/votes`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);

    expect(response.body.code).toEqual("INVALID_POST_ID");
  });

  it('should throw error "VOTE_EXISTS"', async () => {});

  it("should add a vote", async () => {
    const { user } = await createUser({
      isVerified: true,
    });
    const p1 = await generatePost(
      {
        userId: user.userId,
      },
      true,
    );

    const response = await supertest(app)
      .post(`/api/v1/votes`)
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        postId: p1.postId,
        userId: user.userId,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(201);

    expect(response.body.voters.votesCount).toEqual(1);
    expect(response.body.voters.viewerVote.userId).toEqual(user.userId);
    expect(response.body.voters.viewerVote.postId).toEqual(p1.postId);
  });
});
