import { expect, beforeAll, afterAll, vi } from "vitest";
import supertest from "supertest";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

import app from "../../../src/app";
import { createUser } from "../../utils/seed/user";
import * as labsService from "../../../src/ee/services/settings/labs";
import {
  board as generateBoard,
  post as generatePost,
  comment as generateComment,
} from "../../utils/generators";
import { describeEE, itEE } from "../../utils/skipEE";

//  LABS_DISABLED based test
describeEE("LABS_DISABLED", () => {
  beforeAll(() => {
    vi.spyOn(labsService, "isFeatureEnabled").mockResolvedValue(false);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  itEE("should throw error 'LABS_DISABLED' on create comment", async () => {
    const { user: authUser } = await createUser();
    const post = await generatePost(
      {
        userId: authUser.userId,
      },
      true,
    );

    const response = await supertest(app)
      .post(`/api/v1/posts/${post.postId}/comments`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("LABS_DISABLED");
  });

  itEE("should throw error 'LABS_DISABLED' on update comment", async () => {
    const { user: authUser } = await createUser();
    const post = await generatePost(
      {
        userId: authUser.userId,
      },
      true,
    );

    const { comment } = await generateComment(authUser.userId, post.postId);

    const response = await supertest(app)
      .put(`/api/v1/posts/${post.postId}/comments/${comment.id}`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("LABS_DISABLED");
  });

  itEE("should throw error 'LABS_DISABLED' on delete comment", async () => {
    const { user: authUser } = await createUser({
      isVerified: true,
    });
    const post = await generatePost(
      {
        userId: authUser.userId,
      },
      true,
    );

    const { comment } = await generateComment(authUser.userId, post.postId);

    const response = await supertest(app)
      .delete(`/api/v1/posts/${post.postId}/comments/${comment.id}`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("LABS_DISABLED");
  });
});

describeEE("POST /api/v1/posts/:post_id/comments", () => {
  beforeAll(() => {
    vi.spyOn(labsService, "isFeatureEnabled").mockResolvedValue(true);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  // ToDo: add tests to check for permission before creating comments

  itEE("should throw 'INVALID_AUTH_HEADER'", async () => {
    const res = await supertest(app).post(`/api/v1/posts/${uuidv4()}/comments`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_AUTH_HEADER");
  });

  itEE("should throw 'INVALID_TOKEN'", async () => {
    const res = await supertest(app)
      .post(`/api/v1/posts/${uuidv4()}/comments`)
      .set("Authorization", `Bearer fakeToken`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_TOKEN");
  });

  itEE("should throw 'POST_NOT_FOUND'", async () => {
    const { user: authUser } = await createUser();

    const res = await supertest(app)
      .post(`/api/v1/posts/${uuidv4()}/comments`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("POST_NOT_FOUND");
  });

  itEE("should throw 'COMMENT_BODY_MISSING'", async () => {
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
    expect(res.body.code).toBe("VALIDATION_ERROR");
    expect(res.body.errors[0].code).toBe("COMMENT_BODY_MISSING");
  });

  itEE.skip("should create a comment", async () => {
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
    const { author, comment } = res.body.activity;

    // check author details
    expect(author.userId).toBe(authUser.userId);
    expect(author.username).toBe(authUser.username);

    // check comment details
    expect(comment.isEdited).toBeFalsy();
    expect(comment.body).toBe(commentBody);
    expect(comment.parent_id).toBeNull();
  });

  itEE.skip(
    "should create a comment without parent_id if the parent comment doesn't exists",
    async () => {
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
      const { author, comment } = res.body.activity;

      // check author details
      expect(author.userId).toBe(authUser.userId);
      expect(author.username).toBe(authUser.username);

      // check comment details
      expect(comment.isEdited).toBeFalsy();
      expect(comment.body).toBe(commentBody);
      expect(comment.parent_id).toBeNull();
    },
  );

  itEE.skip("should reply to an already existing comment", async () => {
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
    const { comment: parentComment } = await generateComment(
      authUser.userId,
      post.postId,
    );

    // create child comment
    const commentBody = faker.lorem.sentence();
    const res = await supertest(app)
      .post(`/api/v1/posts/${post.postId}/comments`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        parent_id: parentComment.id,
        body: commentBody,
      });

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(201);
    const { author, comment: childComment } = res.body.activity;

    // check author details
    expect(author.userId).toBe(authUser.userId);
    expect(author.username).toBe(authUser.username);

    // check comment details
    expect(childComment.isEdited).toBeFalsy();
    expect(childComment.body).toBe(commentBody);
    expect(childComment.parent_id).toBe(parentComment.id);
  });
});

describeEE("PUT /api/v1/posts/:post_id/comments/:comment_id", () => {
  beforeAll(() => {
    vi.spyOn(labsService, "isFeatureEnabled").mockResolvedValue(true);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  // ToDo: add tests to check for permission before updating comments

  itEE("should throw 'INVALID_AUTH_HEADER'", async () => {
    const res = await supertest(app).put(
      `/api/v1/posts/${uuidv4()}/comments/${uuidv4()}`,
    );

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_AUTH_HEADER");
  });

  itEE("should throw 'INVALID_TOKEN'", async () => {
    const res = await supertest(app)
      .put(`/api/v1/posts/${uuidv4()}/comments/${uuidv4()}`)
      .set("Authorization", `Bearer fakeToken`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_TOKEN");
  });

  itEE("should throw 'POST_NOT_FOUND'", async () => {
    const { user: authUser } = await createUser();

    const res = await supertest(app)
      .put(`/api/v1/posts/${uuidv4()}/comments/${uuidv4()}`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("POST_NOT_FOUND");
  });

  itEE("should throw 'COMMENT_NOT_FOUND'", async () => {
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

  itEE("should throw error 'COMMENT_BODY_MISSING'", async () => {
    const { user: authUser } = await createUser();
    const board = await generateBoard({}, true);
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
      },
      true,
    );
    const { comment } = await generateComment(authUser.userId, post.postId);

    const res = await supertest(app)
      .put(`/api/v1/posts/${post.postId}/comments/${comment.id}`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
    expect(res.body.errors[0].code).toBe("COMMENT_BODY_MISSING");
  });

  itEE.skip("should throw 'UNAUTHORIZED_NOT_AUTHOR'", async () => {
    const { user: authUser } = await createUser();
    const board = await generateBoard({}, true);
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
      },
      true,
    );
    const { comment } = await generateComment(authUser.userId, post.postId);

    const newCommentBody = faker.lorem.sentence();

    const { user: anotherAuthUser } = await createUser();

    const res = await supertest(app)
      .put(`/api/v1/posts/${post.postId}/comments/${comment.id}`)
      .set("Authorization", `Bearer ${anotherAuthUser.authToken}`)
      .send({
        body: newCommentBody,
      });

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("UNAUTHORIZED_NOT_AUTHOR");
  });

  itEE.skip("should update a comment", async () => {
    const { user: authUser } = await createUser();
    const board = await generateBoard({}, true);
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
      },
      true,
    );
    const { comment } = await generateComment(authUser.userId, post.postId);

    const newCommentBody = faker.lorem.sentence();

    const res = await supertest(app)
      .put(`/api/v1/posts/${post.postId}/comments/${comment.id}`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        body: newCommentBody,
      });

    const { comment: updatedComment } = res.body;

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(200);
    expect(updatedComment.is_edited).toBeTruthy();
    expect(updatedComment.created_at).not.toBe(updatedComment.edited_at);
    expect(updatedComment.body).toBe(newCommentBody);
  });
});

describeEE("DELETE /api/v1/posts/:post_id/comments/:comment_id", () => {
  beforeAll(() => {
    vi.spyOn(labsService, "isFeatureEnabled").mockResolvedValue(true);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  // ToDo: add tests to check for permission before delete comments

  itEE("should throw 'INVALID_AUTH_HEADER'", async () => {
    const res = await supertest(app).delete(
      `/api/v1/posts/${uuidv4()}/comments/${uuidv4()}`,
    );

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_AUTH_HEADER");
  });

  itEE("should throw 'INVALID_TOKEN'", async () => {
    const res = await supertest(app)
      .delete(`/api/v1/posts/${uuidv4()}/comments/${uuidv4()}`)
      .set("Authorization", `Bearer fakeToken`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_TOKEN");
  });

  itEE("should throw 'POST_NOT_FOUND'", async () => {
    const { user: authUser } = await createUser();

    const res = await supertest(app)
      .delete(`/api/v1/posts/${uuidv4()}/comments/${uuidv4()}`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("POST_NOT_FOUND");
  });

  itEE("should throw 'COMMENT_NOT_FOUND'", async () => {
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

  itEE.skip("should throw 'UNAUTHORIZED_NOT_AUTHOR'", async () => {
    const { user: authUser } = await createUser();
    const board = await generateBoard({}, true);
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
      },
      true,
    );
    const { comment } = await generateComment(authUser.userId, post.postId);

    const { user: anotherAuthUser } = await createUser();

    const res = await supertest(app)
      .delete(`/api/v1/posts/${post.postId}/comments/${comment.id}`)
      .set("Authorization", `Bearer ${anotherAuthUser.authToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("UNAUTHORIZED_NOT_AUTHOR");
  });

  itEE.skip("should delete a comment", async () => {
    const { user: authUser } = await createUser();
    const board = await generateBoard({}, true);
    const post = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
      },
      true,
    );
    const { comment } = await generateComment(authUser.userId, post.postId);

    const res = await supertest(app)
      .delete(`/api/v1/posts/${post.postId}/comments/${comment.id}`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(res.status).toBe(204);
  });
});

describeEE("GET /api/v1/posts/:post_id/activity", () => {
  beforeAll(() => {
    vi.spyOn(labsService, "isFeatureEnabled").mockResolvedValue(true);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  itEE("should throw error 'POST_NOT_FOUND'", async () => {
    const { user: authUser } = await createUser();

    const res = await supertest(app)
      .get(`/api/v1/posts/${uuidv4()}/activity`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(res.body.code).toBe("POST_NOT_FOUND");
  });

  itEE("should return activity for posts without authentication", async () => {
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
      await generateComment(authUser.userId, post.postId);
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

  itEE("should return activity for posts", async () => {
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
      await generateComment(authUser.userId, post.postId);
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
