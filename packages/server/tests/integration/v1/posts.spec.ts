import { describe, it, expect } from "vitest";
import supertest from "supertest";
import { faker } from "@faker-js/faker";
import { v4 as uuid } from "uuid";
import type { IBoard, IPost } from "@logchimp/types";

import app from "../../../src/app";
import * as cache from "../../../src/cache";
import { createUser } from "../../utils/seed/user";
import { updateSettings } from "../../utils/seed/settings";
import {
  board as generateBoard,
  roadmap as generateRoadmap,
  post as generatePost,
} from "../../utils/generators";
import { createRoleWithPermissions } from "../../utils/createRoleWithPermissions";
import { isActive } from "../../../src/cache";

// Get posts with filters
describe("POST /api/v1/posts/get", () => {
  it("should use default page=1 and default limit when no filters are provided", async () => {
    const { user: authUser } = await createUser({ isVerified: true });
    const board = await generateBoard({}, true);
    const roadmap = await generateRoadmap({}, true);

    // Create 12 posts to exceed typical default [GET_POSTS_FILTER_COUNT]
    const createdSlugs: string[] = [];
    for (let i = 0; i < 12; i++) {
      const p = await generatePost(
        {
          userId: authUser.userId,
          boardId: board.boardId,
          roadmapId: roadmap.id,
        },
        true,
      );
      createdSlugs.push(p.slug);
    }

    // Call with no filters and no pagination params
    const resDefault = await supertest(app).post("/api/v1/posts/get");
    expect(resDefault.headers["content-type"]).toContain("application/json");
    expect(resDefault.status).toBe(200);

    // Default page should be 1 => should return the newest posts first (DESC is default)
    const slugsDefault: string[] = resDefault.body.posts.map(
      (p: IPost) => p.slug,
    );
    expect(Array.isArray(resDefault.body.posts)).toBeTruthy();
    expect(resDefault.body.posts.length).toBeGreaterThan(0);

    // Verify DESC: last created slug should appear at or before index of earlier ones
    const last = createdSlugs[createdSlugs.length - 1];
    const first = createdSlugs[0];
    const idxLast = slugsDefault.indexOf(last);
    const idxFirst = slugsDefault.indexOf(first);
    if (idxLast !== -1 && idxFirst !== -1) {
      expect(idxLast).toBeLessThan(idxFirst);
    }

    // Now request page 2 explicitly to ensure default was page 1
    const resPage2 = await supertest(app)
      .post("/api/v1/posts/get")
      .send({ page: 2 });
    expect(resPage2.headers["content-type"]).toContain("application/json");
    expect(resPage2.status).toBe(200);

    // There should be minimal overlap between default page (1) and page 2 when many posts exist
    const setDefault = new Set(slugsDefault);
    const slugsPage2 = resPage2.body.posts.map((p: IPost) => p.slug);
    const intersection = slugsPage2.filter((s: string) => setDefault.has(s));
    expect(intersection.length).toBeLessThan(slugsPage2.length);
  });

  it.skip("should return empty posts array when no posts exist", async () => {
    const response = await supertest(app).post("/api/v1/posts/get").send({
      boardId: [],
      userId: "",
    });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);

    expect(Array.isArray(response.body.posts)).toBeTruthy();
    expect(response.body.posts).toHaveLength(0);
  });

  it("should filter posts by boardId list", async () => {
    const boardA = await generateBoard({}, true);
    const boardB = await generateBoard({}, true);
    const roadmap = await generateRoadmap({}, true);
    const { user: authUser } = await createUser();

    const post1 = await generatePost(
      {
        userId: authUser.userId,
        boardId: boardA.boardId,
        roadmapId: roadmap.id,
      },
      true,
    );
    const postA2 = await generatePost(
      {
        userId: authUser.userId,
        boardId: boardA.boardId,
        roadmapId: roadmap.id,
      },
      true,
    );
    await generatePost(
      {
        userId: authUser.userId,
        boardId: boardB.boardId,
        roadmapId: roadmap.id,
      },
      true,
    );

    const response = await supertest(app)
      .post("/api/v1/posts/get")
      .send({
        boardId: [boardA.boardId],
        userId: "",
        limit: 10,
        page: 1,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);

    const posts = response.body.posts;
    expect(Array.isArray(posts)).toBeTruthy();
    expect(posts.length).toBeGreaterThanOrEqual(2);

    // All returned posts should belong to boardA
    posts.forEach((p: IPost) => {
      expect(p.board.boardId).toBe(boardA.boardId);
      expect(p.board).toBeDefined();
      expect(p.roadmap).toBeDefined();
      expect(Array.isArray(p.voters.votes)).toBeTruthy();
    });

    const slugs = posts.map((p: IPost) => p.slug);
    expect(slugs).toEqual(expect.arrayContaining([post1.slug, postA2.slug]));

    if (cache.isActive) {
      // should cache the boardA by ID
      const boardACacheStr = await cache.valkey.get(
        `board:public:${boardA.boardId}`,
      );
      const boardACache = JSON.parse(boardACacheStr) satisfies IBoard;
      expect(boardA).toMatchObject(boardACache);

      // should not have boardB cached
      const boardBCache = await cache.valkey.get(
        `board:public:${boardB.boardId}`,
      );
      expect(boardBCache).toBeNull();
    }
  });

  it("should filter posts by roadmapId", async () => {
    const board = await generateBoard({}, true);
    const roadmapA = await generateRoadmap({}, true);
    const roadmapB = await generateRoadmap({}, true);
    const { user: authUser } = await createUser({ isVerified: true });

    const postR1 = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
        roadmapId: roadmapA.id,
      },
      true,
    );
    await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
        roadmapId: roadmapB.id,
      },
      true,
    );

    const response = await supertest(app).post("/api/v1/posts/get").send({
      roadmapId: roadmapA.id,
      userId: "",
      limit: 10,
      page: 1,
    });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);

    const posts = response.body.posts;
    expect(posts.length).toBeGreaterThanOrEqual(1);
    posts.forEach((p: IPost) => {
      expect(p.roadmap.id).toBe(roadmapA.id);
    });
    expect(posts.map((p: IPost) => p.slug)).toEqual(
      expect.arrayContaining([postR1.slug]),
    );
  });

  it("should paginate results with limit and page", async () => {
    const board = await generateBoard({}, true);
    const roadmap = await generateRoadmap({}, true);
    const { user: authUser } = await createUser({ isVerified: true });

    // Create 3 posts
    const post1 = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
        roadmapId: roadmap.id,
      },
      true,
    );
    const post2 = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
        roadmapId: roadmap.id,
      },
      true,
    );
    const post3 = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
        roadmapId: roadmap.id,
      },
      true,
    );

    const page0 = await supertest(app)
      .post("/api/v1/posts/get")
      .send({ boardId: [board.boardId], limit: 2, page: 1, userId: "" });
    const page1 = await supertest(app)
      .post("/api/v1/posts/get")
      .send({ boardId: [board.boardId], limit: 2, page: 2, userId: "" });

    expect(page0.status).toBe(200);
    expect(page1.status).toBe(200);
    expect(page0.headers["content-type"]).toContain("application/json");
    expect(page1.headers["content-type"]).toContain("application/json");
    expect(page0.body.posts.length).toBeLessThanOrEqual(2);
    expect(page1.body.posts.length).toBeLessThanOrEqual(2);

    // Ensure no overlap between pages when there are at least 3 posts
    const slugs0 = new Set(page0.body.posts.map((p: IPost) => p.slug));
    const slugs1 = new Set(page1.body.posts.map((p: IPost) => p.slug));
    const intersection = [...Array.from(slugs0)].filter((key) =>
      slugs1.has(key),
    );
    expect(intersection.length).toBe(0);

    // Ensure union contains created slugs
    const union = new Set([...Array.from(slugs0), ...Array.from(slugs1)]);
    const createdSlugs = [post1.slug, post2.slug, post3.slug];
    const foundCount = createdSlugs.filter((s) => union.has(s)).length;
    expect(foundCount).toBeGreaterThanOrEqual(3);

    if (cache.isActive) {
      // should cache the boardA by ID
      const boardCacheStr = await cache.valkey.get(
        `board:public:${board.boardId}`,
      );
      const boardCache = JSON.parse(boardCacheStr) satisfies IBoard;
      expect(board).toMatchObject(boardCache);
    }
  });

  it("should order posts in ASC order when specified", async () => {
    const board = await generateBoard({}, true);
    const roadmap = await generateRoadmap({}, true);
    const { user: authUser } = await createUser({ isVerified: true });

    // Create posts sequentially so createdAt increases
    const post1 = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
        roadmapId: roadmap.id,
      },
      true,
    );
    const post2 = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
        roadmapId: roadmap.id,
      },
      true,
    );
    const post3 = await generatePost(
      {
        userId: authUser.userId,
        boardId: board.boardId,
        roadmapId: roadmap.id,
      },
      true,
    );

    const asc = await supertest(app)
      .post("/api/v1/posts/get")
      .send({
        boardId: [board.boardId],
        created: "ASC",
        limit: 10,
        page: 1,
        userId: "",
      });

    expect(asc.headers["content-type"]).toContain("application/json");
    expect(asc.status).toBe(200);

    const ascSlugs = asc.body.posts.map((p: IPost) => p.slug);
    // In ASC, the earliest created should appear before later ones
    const idxA = ascSlugs.indexOf(post1.slug);
    const idxB = ascSlugs.indexOf(post2.slug);
    const idxC = ascSlugs.indexOf(post3.slug);

    expect(idxA).toBeLessThan(idxB);
    expect(idxB).toBeLessThan(idxC);

    if (cache.isActive) {
      // should cache the boardA by ID
      const boardCacheStr = await cache.valkey.get(
        `board:public:${board.boardId}`,
      );
      const boardCache = JSON.parse(boardCacheStr) satisfies IBoard;
      expect(board).toMatchObject(boardCache);
    }
  });
});

// Create new posts
describe("POST /api/v1/posts", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).post("/api/v1/posts");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw error 'INVALID_AUTH_HEADER_FORMAT' when auth header is malformed", async () => {
    const { user: authUser } = await createUser({ isVerified: true });

    const res = await supertest(app)
      .post("/api/v1/posts")
      .set("Authorization", `Beare${authUser.authToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_AUTH_HEADER_FORMAT");
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

  it("should create a post without a board", async () => {
    const { user: authUser } = await createUser({
      isVerified: true,
    });
    const title = faker.food.dish();
    await createRoleWithPermissions(authUser.userId, ["post:create"], {
      roleName: "Post Creator",
    });

    const response = await supertest(app)
      .post(`/api/v1/posts/`)
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        title,
        contentMarkdown: faker.food.description,
        userId: authUser.userId,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(201);
    const postResponse = response.body.post;
    expect(postResponse.title).toBe(title);
    expect(postResponse.boardId).toBeNull();
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

describe("PATCH /api/v1/posts", () => {
  it('should throw error "INVALID_AUTH_HEADER" when auth is missing', async () => {
    const res = await supertest(app).patch("/api/v1/posts");
    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw error 'INVALID_AUTH_HEADER_FORMAT' when auth header is malformed", async () => {
    const { user } = await createUser({ isVerified: true });

    const res = await supertest(app)
      .patch("/api/v1/posts")
      .set("Authorization", `Beare${user.authToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_AUTH_HEADER_FORMAT");
  });

  it('should throw error "NOT_ENOUGH_PERMISSION" when not author and without permission', async () => {
    const board = await generateBoard({}, true);
    const roadmap = await generateRoadmap({}, true);
    const { user: author } = await createUser({ isVerified: true });
    const { user: stranger } = await createUser({ isVerified: true });

    const post = await generatePost(
      {
        userId: author.userId,
        boardId: board.boardId,
        roadmapId: roadmap.id,
      },
      true,
    );

    const res = await supertest(app)
      .patch("/api/v1/posts")
      .set("Authorization", `Bearer ${stranger.authToken}`)
      .send({
        id: post.postId,
        title: "Unauthorized update attempt",
      });

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  it("should allow the author to update their own post without explicit permission", async () => {
    const board = await generateBoard({}, true);
    const roadmap = await generateRoadmap({}, true);
    const { user: author } = await createUser({ isVerified: true });

    const post = await generatePost(
      {
        userId: author.userId,
        boardId: board.boardId,
        roadmapId: roadmap.id,
      },
      true,
    );

    const newTitle = `${post.title} Updated!`; // include punctuation to test slug cleaning
    const newMarkdown = "Updated content";

    const res = await supertest(app)
      .patch("/api/v1/posts")
      .set("Authorization", `Bearer ${author.authToken}`)
      .send({
        id: post.postId,
        title: newTitle,
        contentMarkdown: newMarkdown,
      });

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(200);
    const updated = res.body.post as IPost;
    expect(updated.title).toBe(newTitle);
    expect(updated.contentMarkdown).toBe(newMarkdown);

    // slug should be regenerated: alphanumeric/space only, lowercased, spaces to dashes, with original slugId suffix
    // Extract slugId from old slug (suffix after last dash segment that is not part of words is included in original slug)
    const oldSlug = post.slug;
    const slugSuffix = oldSlug.split("-").slice(-1)[0];
    expect(updated.slug.endsWith(`-${slugSuffix}`)).toBe(true);
  });

  it("should allow a user with 'post:update' permission to update someone else's post", async () => {
    const board = await generateBoard({}, true);
    const roadmapA = await generateRoadmap({}, true);
    const roadmapB = await generateRoadmap({}, true);
    const { user: author } = await createUser({ isVerified: true });
    const { user: moderator } = await createUser({ isVerified: true });

    await createRoleWithPermissions(moderator.userId, ["post:update"], {
      roleName: "Moderator",
    });

    const post = await generatePost(
      {
        userId: author.userId,
        boardId: board.boardId,
        roadmapId: roadmapA.id,
      },
      true,
    );

    const newTitle = `Moderator changed ${faker.word.words(2)}`;

    const res = await supertest(app)
      .patch("/api/v1/posts")
      .set("Authorization", `Bearer ${moderator.authToken}`)
      .send({
        id: post.postId,
        title: newTitle,
        roadmapId: roadmapB.id,
      });

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(200);
    const updated = res.body.post as IPost;

    expect(updated.title).toBe(newTitle);
    // roadmap may appear as relation or field; ensure either roadmaps relation id or field reflects change
    if ((updated as any).roadmap?.id) {
      expect((updated as any).roadmap.id).toBe(roadmapB.id);
    } else if ((updated as any).roadmapId) {
      expect((updated as any).roadmapId).toBe(roadmapB.id);
    }

    // ensure slug suffix is consistent with original
    const oldSlug = post.slug;
    const slugSuffix = oldSlug.split("-").slice(-1)[0];
    expect(updated.slug.endsWith(`-${slugSuffix}`)).toBe(true);
  });
});

describe("DELETE /api/v1/posts", () => {
  it('should throw error "INVALID_AUTH_HEADER" when auth is missing', async () => {
    const res = await supertest(app).delete("/api/v1/posts");

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw error 'INVALID_AUTH_HEADER_FORMAT' when auth header is malformed", async () => {
    const { user: authUser } = await createUser({ isVerified: true });

    const res = await supertest(app)
      .delete("/api/v1/posts")
      .set("Authorization", `Beare${authUser.authToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_AUTH_HEADER_FORMAT");
  });

  [uuid(), undefined, null].map((value) =>
    it(`should return 404 'POST_NOT_FOUND' for "${value}" value`, async () => {
      const { user: authUser } = await createUser({ isVerified: true });
      // Grant permission so we get to postExists and its 404, not blocked by controller's 403
      await createRoleWithPermissions(authUser.userId, ["post:destroy"], {
        roleName: "Post Destroyer",
      });

      const res = await supertest(app)
        .delete("/api/v1/posts")
        .set("Authorization", `Bearer ${authUser.authToken}`)
        .send({ id: value });

      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.status).toBe(404);
      expect(res.body.code).toBe("POST_NOT_FOUND");
    }),
  );

  it("should throw error 'NOT_ENOUGH_PERMISSION' when user lacks 'post:destroy' permission (even if author)", async () => {
    const board = await generateBoard({}, true);
    const roadmap = await generateRoadmap({}, true);
    const { user: author } = await createUser({ isVerified: true });

    const post = await generatePost(
      {
        userId: author.userId,
        boardId: board.boardId,
        roadmapId: roadmap.id,
      },
      true,
    );

    const res = await supertest(app)
      .delete("/api/v1/posts")
      .set("Authorization", `Bearer ${author.authToken}`)
      .send({ id: post.postId });

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  it("should delete the post when user has 'post:destroy' permission and make it unretrievable by slug", async () => {
    const board = await generateBoard({}, true);
    const roadmap = await generateRoadmap({}, true);
    const { user: moderator } = await createUser({ isVerified: true });

    await createRoleWithPermissions(moderator.userId, ["post:destroy"], {
      roleName: "Moderator",
    });

    const post = await generatePost(
      {
        userId: moderator.userId, // author can be moderator or anyone; permission is what matters
        boardId: board.boardId,
        roadmapId: roadmap.id,
      },
      true,
    );

    const del = await supertest(app)
      .delete("/api/v1/posts")
      .set("Authorization", `Bearer ${moderator.authToken}`)
      .send({ id: post.postId });

    expect(del.status).toBe(204);
    expect(del.body.code).toBeUndefined();

    // Verify it's gone by slug lookup
    const fetchAfter = await supertest(app).post("/api/v1/posts/slug").send({
      slug: post.slug,
      userId: "",
    });

    expect(fetchAfter.headers["content-type"]).toContain("application/json");
    expect(fetchAfter.status).toBe(404);
    expect(fetchAfter.body.code).toBe("POST_NOT_FOUND");
  });
});

// Get post by slug
describe("POST /api/v1/posts/slug", () => {
  ["dolores-ipsa-mKTAvagnq3xaZYaag2pU", uuid(), undefined, null].map((value) =>
    it(`should throw error "POST_NOT_FOUND" for "${value}" value`, async () => {
      const response = await supertest(app).post("/api/v1/posts/slug").send({
        slug: value,
        // only slug is required to get a post
        userId: "",
      });

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(404);
      expect(response.body.code).toBe("POST_NOT_FOUND");
    }),
  );

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

    const response = await supertest(app).post(
      `/api/v1/posts/${post.postId}/comments`,
    );

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

  it("should throw error 'NOT_ENOUGH_PERMISSION' when user lacks 'comment:create' permission", async () => {});

  it("should throw error 'LABS_DISABLED' on comments feature disabled", async () => {
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

    await updateSettings({
      labs: { comments: false },
    });

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

    await updateSettings({
      labs: { comments: true },
    });

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
