import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import { faker } from "@faker-js/faker";

import app from "../../../src/app";
import database from "../../../src/database";
import { createUser } from "../../utils/seed/user";
import { v4 as uuidv4 } from "uuid";
import {
  board as generateBoard,
  post as generatePost,
} from "../../utils/generators";

beforeAll(async () => {
  // Enable commenting from labs
  await database
    .update({
      labs: database.raw(`labs::jsonb || '{"comments": true}'`),
    })
    .from("settings");
});

afterAll(async () => {
  // Disable commenting from labs
  await database
    .update({
      labs: database.raw(`labs::jsonb || '{"comments": false}'`),
    })
    .from("settings");
});

describe("POST /api/v1/posts/:post_id/comments", () => {
  // ToDo: add tests to check for permission before creating comments

  it("should throw 'INVALID_AUTH_HEADER'", async () => {
    const res = await supertest(app).post(`/api/v1/posts/${uuidv4()}/comments`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw 'INVALID_TOKEN'", async () => {
    const res = await supertest(app)
      .post(`/api/v1/posts/${uuidv4()}/comments`)
      .set("Authorization", `Bearer fakeToken`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_TOKEN");
  });

  it("should throw 'POST_NOT_FOUND'", async () => {
    const { user: authUser } = await createUser();

    const res = await supertest(app)
      .post(`/api/v1/posts/${uuidv4()}/comments`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("POST_NOT_FOUND");
  });

  it("should throw 'COMMENT_BODY_MISSING'", async () => {
    const { user: authUser } = await createUser();
    const board = await generateBoard({}, true);
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
      },
      true,
    );

    const res = await supertest(app)
      .post(`/api/v1/posts/${post.postId}/comments`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("COMMENT_BODY_MISSING");
  });

  it("should create a comment", async () => {
    const { user: authUser } = await createUser();
    const board = await generateBoard({}, true);
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
      },
      true,
    );
    const commentBody = faker.lorem.sentence();

    const res = await supertest(app)
      .post(`/api/v1/posts/${post.postId}/comments`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        body: commentBody,
      });

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(201);
    const { author, comment } = res.body.comment;

    // check author details
    expect(author.userId).toBe(authUser.userId);
    expect(author.username).toBe(authUser.username);

    // check comment details
    expect(comment.isEdited).toBeFalsy();
    expect(comment.body).toBe(commentBody);
    expect(comment.parent_id).toBeNull();
  });

  it("should create a comment without parent_id if the parent comment doesn't exists", async () => {
    const { user: authUser } = await createUser();
    const board = await generateBoard({}, true);
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
      },
      true,
    );
    const commentBody = faker.lorem.sentence();

    const res = await supertest(app)
      .post(`/api/v1/posts/${post.postId}/comments`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        parent_id: uuidv4(),
        body: commentBody,
      });

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(201);
    const { author, comment } = res.body.comment;

    // check author details
    expect(author.userId).toBe(authUser.userId);
    expect(author.username).toBe(authUser.username);

    // check comment details
    expect(comment.isEdited).toBeFalsy();
    expect(comment.body).toBe(commentBody);
    expect(comment.parent_id).toBeNull();
  });

  it("should reply to an already existing comment", async () => {
    const { user: authUser } = await createUser();
    const board = await generateBoard({}, true);
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
      },
      true,
    );

    // create parent comment
    const commentBody1 = faker.lorem.sentence();
    const res1 = await supertest(app)
      .post(`/api/v1/posts/${post.postId}/comments`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        body: commentBody1,
      });
    const { comment: comment1 } = res1.body.comment;

    // create child comment
    const commentBody2 = faker.lorem.sentence();
    const res2 = await supertest(app)
      .post(`/api/v1/posts/${post.postId}/comments`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        parent_id: comment1.id,
        body: commentBody2,
      });

    expect(res2.headers["content-type"]).toContain("application/json");
    expect(res2.status).toBe(201);
    const { author, comment: comment2 } = res2.body.comment;

    // check author details
    expect(author.userId).toBe(authUser.userId);
    expect(author.username).toBe(authUser.username);

    // check comment details
    expect(comment2.isEdited).toBeFalsy();
    expect(comment2.body).toBe(commentBody2);
    expect(comment2.parent_id).toBe(comment1.id);
  });
});

describe("PUT /api/v1/posts/:post_id/comments/:comment_id", () => {
  // ToDo: add tests to check for permission before updating comments

  it("should throw 'INVALID_AUTH_HEADER'", async () => {
    const res = await supertest(app).put(
      `/api/v1/posts/${uuidv4()}/comments/${uuidv4()}`,
    );

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw 'INVALID_TOKEN'", async () => {
    const res = await supertest(app)
      .put(`/api/v1/posts/${uuidv4()}/comments/${uuidv4()}`)
      .set("Authorization", `Bearer fakeToken`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_TOKEN");
  });

  it("should throw 'POST_NOT_FOUND'", async () => {
    const { user: authUser } = await createUser();

    const res = await supertest(app)
      .put(`/api/v1/posts/${uuidv4()}/comments/${uuidv4()}`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("POST_NOT_FOUND");
  });

  it("should throw 'COMMENT_NOT_FOUND'", async () => {
    const { user: authUser } = await createUser();
    const board = await generateBoard({}, true);
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
      },
      true,
    );

    const res = await supertest(app)
      .put(`/api/v1/posts/${post.postId}/comments/${uuidv4()}`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("COMMENT_NOT_FOUND");
  });

  it("should throw error 'COMMENT_BODY_MISSING'", async () => {
    const { user: authUser } = await createUser();
    const board = await generateBoard({}, true);
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
      },
      true,
    );
    const commentBody = faker.lorem.sentence();

    const res1 = await supertest(app)
      .post(`/api/v1/posts/${post.postId}/comments`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        body: commentBody,
      });

    const { comment } = res1.body.comment;

    const res2 = await supertest(app)
      .put(`/api/v1/posts/${post.postId}/comments/${comment.id}`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(res2.headers["content-type"]).toContain("application/json");
    expect(res2.status).toBe(400);
    expect(res2.body.code).toBe("COMMENT_BODY_MISSING");
  });

  it("should throw 'UNAUTHORIZED_NOT_AUTHOR'", async () => {
    const { user: authUser } = await createUser();
    const board = await generateBoard({}, true);
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
      },
      true,
    );
    const commentBody = faker.lorem.sentence();

    const res1 = await supertest(app)
      .post(`/api/v1/posts/${post.postId}/comments`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        body: commentBody,
      });

    const { comment } = res1.body.comment;

    const updatedCommentBody = faker.lorem.sentence();

    const { user: anotherAuthUser } = await createUser();

    const res2 = await supertest(app)
      .put(`/api/v1/posts/${post.postId}/comments/${comment.id}`)
      .set("Authorization", `Bearer ${anotherAuthUser.authToken}`)
      .send({
        body: updatedCommentBody,
      });

    expect(res2.headers["content-type"]).toContain("application/json");
    expect(res2.status).toBe(403);
    expect(res2.body.code).toBe("UNAUTHORIZED_NOT_AUTHOR");
  });

  it("should update a comment", async () => {
    const { user: authUser } = await createUser();
    const board = await generateBoard({}, true);
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
      },
      true,
    );
    const commentBody = faker.lorem.sentence();

    const res1 = await supertest(app)
      .post(`/api/v1/posts/${post.postId}/comments`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        body: commentBody,
      });

    const { comment } = res1.body.comment;

    const updatedCommentBody = faker.lorem.sentence();

    const res2 = await supertest(app)
      .put(`/api/v1/posts/${post.postId}/comments/${comment.id}`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        body: updatedCommentBody,
      });

    const { comment: updatedComment } = res2.body;

    expect(res2.headers["content-type"]).toContain("application/json");
    expect(res2.status).toBe(200);
    expect(updatedComment.is_edited).toBeTruthy();
    expect(updatedComment.created_at).not.toBe(updatedComment.edited_at);
    expect(updatedComment.body).toBe(updatedCommentBody);
  });
});

describe("DELETE /api/v1/posts/:post_id/comments/:comment_id", () => {
  // ToDo: add tests to check for permission before delete comments

  it("should throw 'INVALID_AUTH_HEADER'", async () => {
    const res = await supertest(app).delete(
      `/api/v1/posts/${uuidv4()}/comments/${uuidv4()}`,
    );

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw 'INVALID_TOKEN'", async () => {
    const res = await supertest(app)
      .delete(`/api/v1/posts/${uuidv4()}/comments/${uuidv4()}`)
      .set("Authorization", `Bearer fakeToken`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_TOKEN");
  });

  it("should throw 'POST_NOT_FOUND'", async () => {
    const { user: authUser } = await createUser();

    const res = await supertest(app)
      .delete(`/api/v1/posts/${uuidv4()}/comments/${uuidv4()}`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("POST_NOT_FOUND");
  });

  it("should throw 'COMMENT_NOT_FOUND'", async () => {
    const { user: authUser } = await createUser();
    const board = await generateBoard({}, true);
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
      },
      true,
    );

    const res = await supertest(app)
      .delete(`/api/v1/posts/${post.postId}/comments/${uuidv4()}`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("COMMENT_NOT_FOUND");
  });

  it("should throw 'UNAUTHORIZED_NOT_AUTHOR'", async () => {
    const { user: authUser } = await createUser();
    const board = await generateBoard({}, true);
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
      },
      true,
    );
    const commentBody = faker.lorem.sentence();

    const res1 = await supertest(app)
      .post(`/api/v1/posts/${post.postId}/comments`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        body: commentBody,
      });

    const { comment } = res1.body.comment;

    const { user: anotherAuthUser } = await createUser();

    const res2 = await supertest(app)
      .delete(`/api/v1/posts/${post.postId}/comments/${comment.id}`)
      .set("Authorization", `Bearer ${anotherAuthUser.authToken}`);

    expect(res2.headers["content-type"]).toContain("application/json");
    expect(res2.status).toBe(403);
    expect(res2.body.code).toBe("UNAUTHORIZED_NOT_AUTHOR");
  });

  it("should delete a comment", async () => {
    const { user: authUser } = await createUser();
    const board = await generateBoard({}, true);
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
      },
      true,
    );
    const commentBody = faker.lorem.sentence();

    const res1 = await supertest(app)
      .post(`/api/v1/posts/${post.postId}/comments`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        body: commentBody,
      });

    const { comment } = res1.body.comment;

    const res2 = await supertest(app)
      .delete(`/api/v1/posts/${post.postId}/comments/${comment.id}`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(res2.status).toBe(204);
  });
});

describe("GET /api/v1/posts/:post_id/activity", () => {
  it("should throw error 'POST_NOT_FOUND'", async () => {
    const { user: authUser } = await createUser();

    const res = await supertest(app)
      .get(`/api/v1/posts/${uuidv4()}/activity`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(res.body.code).toBe("POST_NOT_FOUND");
  });

  it("should return activity for posts without authentication", async () => {
    const { user: authUser } = await createUser();
    const board = await generateBoard({}, true);
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
      },
      true,
    );

    for (let i = 0; i < 5; i++) {
      await supertest(app)
        .post(`/api/v1/posts/${post.postId}/comments`)
        .set("Authorization", `Bearer ${authUser.authToken}`)
        .send({
          body: faker.lorem.sentence(),
        });
    }

    const res = await supertest(app).get(
      `/api/v1/posts/${post.postId}/activity`,
    );

    expect(res.body.activity.length).toEqual(5);
    for (let i = 0; i < 5; i++) {
      const { author } = res.body.activity[i];
      expect(author.user_id).toBe(authUser.userId);
    }
  });

  it("should return activity for posts", async () => {
    const { user: authUser } = await createUser();
    const board = await generateBoard({}, true);
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
      },
      true,
    );

    for (let i = 0; i < 5; i++) {
      await supertest(app)
        .post(`/api/v1/posts/${post.postId}/comments`)
        .set("Authorization", `Bearer ${authUser.authToken}`)
        .send({
          body: faker.lorem.sentence(),
        });
    }

    const res = await supertest(app)
      .get(`/api/v1/posts/${post.postId}/activity`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(res.body.activity.length).toEqual(5);
    for (let i = 0; i < 5; i++) {
      const { author } = res.body.activity[i];
      expect(author.user_id).toBe(authUser.userId);
    }
  });
});
