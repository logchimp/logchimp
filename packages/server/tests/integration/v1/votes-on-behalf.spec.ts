import { beforeAll, afterAll, vi, expect } from "vitest";
import supertest from "supertest";
import { v4 as uuid } from "uuid";

import app from "../../../src/app";
import { createUser } from "../../utils/seed/user";
import {
  post as generatePost,
  vote as assignVote,
} from "../../utils/generators";
import { createRoleWithPermissions } from "../../utils/createRoleWithPermissions";
import * as labsService from "../../../src/ee/services/settings/labs";
import { describeEE, itEE } from "../../utils/skipEE";

const voteOnBehalfRoute = (postId: string, userId: string) =>
  `/api/v1/posts/${postId}/votes/${userId}`;

describeEE("LABS_DISABLED", () => {
  beforeAll(() => {
    vi.spyOn(labsService, "isFeatureEnabled").mockResolvedValue(false);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  itEE(
    "POST: should return LABS_DISABLED when voteOnBehalf feature is disabled",
    async () => {
      const { user: admin } = await createUser({ isVerified: true });
      const { user: targetUser } = await createUser({ isVerified: true });
      const post = await generatePost({ userId: admin.userId }, true);

      const response = await supertest(app)
        .post(voteOnBehalfRoute(post.postId, targetUser.userId))
        .set("Authorization", `Bearer ${admin.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(403);
      expect(response.body.code).toBe("LABS_DISABLED");
    },
  );

  itEE(
    "DELETE: should return LABS_DISABLED when voteOnBehalf feature is disabled",
    async () => {
      const { user: admin } = await createUser({ isVerified: true });
      const { user: targetUser } = await createUser({ isVerified: true });
      const post = await generatePost({ userId: admin.userId }, true);

      const response = await supertest(app)
        .delete(voteOnBehalfRoute(post.postId, targetUser.userId))
        .set("Authorization", `Bearer ${admin.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(403);
      expect(response.body.code).toBe("LABS_DISABLED");
    },
  );
});

describeEE("POST /api/v1/posts/:post_id/votes/:user_id", () => {
  beforeAll(() => {
    vi.spyOn(labsService, "isFeatureEnabled").mockResolvedValue(true);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  itEE(
    'should throw error "INVALID_AUTH_HEADER" when no auth token is provided',
    async () => {
      const response = await supertest(app).post(
        voteOnBehalfRoute(uuid(), uuid()),
      );

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(400);
      expect(response.body.code).toBe("INVALID_AUTH_HEADER");
    },
  );

  itEE(
    'should throw error "POST_NOT_FOUND" for a non-UUID post_id',
    async () => {
      const { user } = await createUser({ isVerified: true });

      const response = await supertest(app)
        .post(voteOnBehalfRoute("not-a-valid-uuid", uuid()))
        .set("Authorization", `Bearer ${user.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(404);
      expect(response.body.code).toBe("POST_NOT_FOUND");
    },
  );

  itEE(
    'should throw error "POST_NOT_FOUND" when post does not exist in DB',
    async () => {
      const { user } = await createUser({ isVerified: true });

      const response = await supertest(app)
        .post(voteOnBehalfRoute(uuid(), uuid()))
        .set("Authorization", `Bearer ${user.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(404);
      expect(response.body.code).toBe("POST_NOT_FOUND");
    },
  );

  itEE(
    'should throw error "NOT_ENOUGH_PERMISSION" when user lacks "vote:assign" permission',
    async () => {
      // @everyone does not include vote:assign so a regular user is sufficient
      const { user } = await createUser({ isVerified: true });
      const { user: targetUser } = await createUser({ isVerified: true });
      const post = await generatePost({ userId: user.userId }, true);

      const response = await supertest(app)
        .post(voteOnBehalfRoute(post.postId, targetUser.userId))
        .set("Authorization", `Bearer ${user.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(403);
      expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
    },
  );

  itEE(
    'should throw error "USER_NOT_FOUND" when the target user does not exist',
    async () => {
      const { user: admin } = await createUser({ isVerified: true });
      await createRoleWithPermissions(admin.userId, ["vote:assign"]);
      const post = await generatePost({ userId: admin.userId }, true);

      const response = await supertest(app)
        .post(voteOnBehalfRoute(post.postId, uuid()))
        .set("Authorization", `Bearer ${admin.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(404);
      expect(response.body.code).toBe("USER_NOT_FOUND");
    },
  );

  itEE(
    'should throw error "VOTE_EXISTS" when the target user has already voted on the post',
    async () => {
      const { user: admin } = await createUser({ isVerified: true });
      await createRoleWithPermissions(admin.userId, ["vote:assign"]);
      const { user: targetUser } = await createUser({ isVerified: true });
      const post = await generatePost({ userId: admin.userId }, true);
      await assignVote(targetUser.userId, post.postId);

      const response = await supertest(app)
        .post(voteOnBehalfRoute(post.postId, targetUser.userId))
        .set("Authorization", `Bearer ${admin.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(409);
      expect(response.body.code).toBe("VOTE_EXISTS");
    },
  );

  itEE("should add a vote on behalf of the target user", async () => {
    const { user: admin } = await createUser({ isVerified: true });
    await createRoleWithPermissions(admin.userId, ["vote:assign"]);
    const { user: targetUser } = await createUser({ isVerified: true });
    const post = await generatePost({ userId: admin.userId }, true);

    const response = await supertest(app)
      .post(voteOnBehalfRoute(post.postId, targetUser.userId))
      .set("Authorization", `Bearer ${admin.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.vote.voteId).toBeDefined();
    expect(response.body.vote.user.userId).toBe(targetUser.userId);
    expect(response.body.vote.user.username).toBe(targetUser.username);
  });
});

describeEE("DELETE /api/v1/posts/:post_id/votes/:user_id", () => {
  beforeAll(() => {
    vi.spyOn(labsService, "isFeatureEnabled").mockResolvedValue(true);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  itEE(
    'should throw error "INVALID_AUTH_HEADER" when no auth token is provided',
    async () => {
      const response = await supertest(app).delete(
        voteOnBehalfRoute(uuid(), uuid()),
      );

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(400);
      expect(response.body.code).toBe("INVALID_AUTH_HEADER");
    },
  );

  itEE(
    'should throw error "POST_NOT_FOUND" for a non-UUID post_id',
    async () => {
      const { user } = await createUser({ isVerified: true });

      const response = await supertest(app)
        .delete(voteOnBehalfRoute("not-a-valid-uuid", uuid()))
        .set("Authorization", `Bearer ${user.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(404);
      expect(response.body.code).toBe("POST_NOT_FOUND");
    },
  );

  itEE(
    'should throw error "POST_NOT_FOUND" when post does not exist in DB',
    async () => {
      const { user } = await createUser({ isVerified: true });

      const response = await supertest(app)
        .delete(voteOnBehalfRoute(uuid(), uuid()))
        .set("Authorization", `Bearer ${user.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(404);
      expect(response.body.code).toBe("POST_NOT_FOUND");
    },
  );

  itEE(
    'should throw error "NOT_ENOUGH_PERMISSION" when user lacks "vote:unassign" permission',
    async () => {
      const { user } = await createUser({ isVerified: true });
      const { user: targetUser } = await createUser({ isVerified: true });
      const post = await generatePost({ userId: user.userId }, true);

      const response = await supertest(app)
        .delete(voteOnBehalfRoute(post.postId, targetUser.userId))
        .set("Authorization", `Bearer ${user.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(403);
      expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
    },
  );

  itEE(
    'should throw error "USER_NOT_FOUND" when the target user does not exist',
    async () => {
      const { user: admin } = await createUser({ isVerified: true });
      await createRoleWithPermissions(admin.userId, ["vote:unassign"]);
      const post = await generatePost({ userId: admin.userId }, true);

      const response = await supertest(app)
        .delete(voteOnBehalfRoute(post.postId, uuid()))
        .set("Authorization", `Bearer ${admin.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(404);
      expect(response.body.code).toBe("USER_NOT_FOUND");
    },
  );

  itEE(
    'should throw error "VOTE_NOT_FOUND" when the target user has no vote on the post',
    async () => {
      const { user: admin } = await createUser({ isVerified: true });
      await createRoleWithPermissions(admin.userId, ["vote:unassign"]);
      const { user: targetUser } = await createUser({ isVerified: true });
      const post = await generatePost({ userId: admin.userId }, true);

      const response = await supertest(app)
        .delete(voteOnBehalfRoute(post.postId, targetUser.userId))
        .set("Authorization", `Bearer ${admin.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(404);
      expect(response.body.code).toBe("VOTE_NOT_FOUND");
    },
  );

  itEE("should remove a vote on behalf of the target user", async () => {
    const { user: admin } = await createUser({ isVerified: true });
    await createRoleWithPermissions(admin.userId, ["vote:unassign"]);
    const { user: targetUser } = await createUser({ isVerified: true });
    const post = await generatePost({ userId: admin.userId }, true);
    await assignVote(targetUser.userId, post.postId);

    const response = await supertest(app)
      .delete(voteOnBehalfRoute(post.postId, targetUser.userId))
      .set("Authorization", `Bearer ${admin.authToken}`);

    expect(response.status).toBe(202);
  });
});
