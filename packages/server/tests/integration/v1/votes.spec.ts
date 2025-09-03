import { describe, it, expect } from "vitest";
import supertest from "supertest";
import { v4 as uuid } from "uuid";

import app from "../../../src/app";
import { createUser } from "../../utils/seed/user";
import { cleanDb } from "../../utils/db";
import {
  post as generatePost,
  vote as assignVote,
} from "../../utils/generators";

// Add vote to post
describe("POST /api/v1/votes", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    await cleanDb();
    const response = await supertest(app).post("/api/v1/votes");

    expect(response.headers["content-type"]).toBe("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  // TODO: test the sceneries where a user does not have a 'vote:create' permission
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

    expect(response.headers["content-type"]).toBe("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  it('should throw error "INVALID_POST_ID"', async () => {
    const { user } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .post(`/api/v1/votes`)
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toBe("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_POST_ID");
  });

  it('should throw error "VOTE_EXISTS"', async () => {
    const { user } = await createUser({
      isVerified: true,
    });
    const p1 = await generatePost(
      {
        userId: user.userId,
      },
      true,
    );
    await assignVote(user.userId, p1.postId);

    const response = await supertest(app)
      .post(`/api/v1/votes`)
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        postId: p1.postId,
        userId: user.userId,
      });

    expect(response.headers["content-type"]).toBe("application/json");
    expect(response.status).toBe(409);
    expect(response.body.code).toBe("VOTE_EXISTS");
  });

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

    expect(response.headers["content-type"]).toBe("application/json");
    expect(response.status).toBe(201);

    expect(response.body.voters.votesCount).toBe(1);
    expect(response.body.voters.viewerVote.userId).toBe(user.userId);
    expect(response.body.voters.viewerVote.postId).toBe(p1.postId);
  });
});

describe("DELETE /api/v1/votes", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    await cleanDb();
    const response = await supertest(app).delete("/api/v1/votes");

    expect(response.headers["content-type"]).toBe("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  // TODO: test the sceneries where a user does not have a 'vote:destroy' permission
  it.skip("should throw error \"NOT_ENOUGH_PERMISSION\" for user without 'vote:destroy' permission", async () => {
    const { user: authUser } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .delete("/api/v1/votes")
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        postId: uuid(),
      });

    expect(response.headers["content-type"]).toBe("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  it('should throw error "INVALID_POST_ID"', async () => {
    const { user } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .delete("/api/v1/votes")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toBe("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_POST_ID");
  });

  it('should throw error "VOTE_NOT_FOUND"', async () => {
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
      .delete("/api/v1/votes")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        postId: p1.postId,
      });

    expect(response.headers["content-type"]).toBe("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("VOTE_NOT_FOUND");
  });

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
    await assignVote(user.userId, p1.postId);

    const response = await supertest(app)
      .delete("/api/v1/votes")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        postId: p1.postId,
      });

    expect(response.headers["content-type"]).toBe("application/json");
    expect(response.status).toBe(200);

    expect(response.body.voters.votesCount).toBe(0);
    expect(response.body.voters.votes).toHaveLength(0);
    expect(response.body.voters.viewerVote).toBeUndefined();
  });
});
