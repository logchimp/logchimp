import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import { faker } from "@faker-js/faker";
import { v4 as uuid } from "uuid";
import type {
  IGetRoadmapByUrlResponseBody,
  IRoadmapPrivate,
} from "@logchimp/types";

import app from "../../../src/app";
import { roadmap as generateRoadmap } from "../../utils/generators";
import database from "../../../src/database";

import { createUser } from "../../utils/seed/user";
import { createRoleWithPermissions } from "../../utils/createRoleWithPermissions";

// Get all roadmaps
describe("GET /api/v1/roadmaps", () => {
  beforeAll(async () => {
    await database.transaction(async (trx) => {
      // Seed 100 roadmaps with ascending indices: 50 public, 50 private
      for (let i = 0; i < 100; i++) {
        const isPublic = i < 50; // first 50 public
        const r = await generateRoadmap({ display: isPublic, index: i + 1 });
        await trx.insert(r).into("roadmaps");
      }
    });
  });

  it.skip("should get 0 roadmaps", async () => {
    const response = await supertest(app).get("/api/v1/roadmaps");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(0);
    expect(response.body.roadmaps).toHaveLength(0);
  });

  it.skip("should return correct data for last page", async () => {
    const res = await supertest(app)
      .get("/api/v1/roadmaps")
      .query({ first: 20 });

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(200);

    expect(res.body.results).toHaveLength(10);
    expect(res.body.page_info.has_next_page).toBe(false);
    expect(res.body.page_info.end_cursor).toBeTypeOf("string");
    expect(res.body.page_info.start_cursor).toBeTypeOf("string");
    expect(res.body.total_count).toBe(10);
  });

  describe("'?first=' param", () => {
    it("should return default list when no '?first=' param", async () => {
      const res = await supertest(app).get("/api/v1/roadmaps");

      const firstItem: IRoadmapPrivate = res.body.results[0];
      const lastItem: IRoadmapPrivate =
        res.body.results[res.body.results.length - 1];

      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.status).toBe(200);

      expect(res.body.results).toHaveLength(20);
      expect(res.body.roadmaps).toHaveLength(20);
      expect(Array.isArray(res.body.results)).toBeTruthy();
      expect(Array.isArray(res.body.roadmaps)).toBeTruthy();

      expect(res.body.page_info).toBeDefined();
      expect(typeof res.body.page_info.count).toBe("number");
      expect(typeof res.body.page_info.current_page).toBe("number");
      expect(typeof res.body.page_info.has_next_page).toBe("boolean");

      expect(res.body.page_info.start_cursor).toBe(firstItem.id);
      expect(res.body.page_info.end_cursor).toBe(lastItem.id);
      expect(res.body.page_info.start_cursor).toBeTypeOf("string");
      expect(res.body.page_info.end_cursor).toBeTypeOf("string");
      expect(res.body.page_info.has_next_page).toBe(true);

      // expect(res.body.total_count).toBe(15);
    });

    it("should return 5 items per page with '?first=5'", async () => {
      const res = await supertest(app)
        .get("/api/v1/roadmaps")
        .query({ first: 5 });

      const firstItem: IRoadmapPrivate = res.body.results[0];
      const lastItem: IRoadmapPrivate =
        res.body.results[res.body.results.length - 1];

      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.status).toBe(200);

      expect(res.body.results).toHaveLength(5);
      expect(res.body.roadmaps).toHaveLength(5);
      expect(Array.isArray(res.body.results)).toBeTruthy();
      expect(Array.isArray(res.body.roadmaps)).toBeTruthy();

      expect(res.body.page_info.start_cursor).toBe(firstItem.id);
      expect(res.body.page_info.end_cursor).toBe(lastItem.id);
      expect(res.body.page_info.start_cursor).toBeTypeOf("string");
      expect(res.body.page_info.end_cursor).toBeTypeOf("string");
      expect(res.body.page_info.has_next_page).toBe(true);
      expect(res.body.page_info.end_cursor).not.toBe(
        res.body.page_info.start_cursor,
      );
      expect(res.body.page_info.count).toBe(5);

      // expect(res.body.total_pages).toBe(2); // 10 public / 5 per page
      // expect(res.body.total_count).toBe(10);
    });

    it("should cap the '?first=' param value with 20 max items", async () => {
      const res = await supertest(app)
        .get("/api/v1/roadmaps")
        .query({ first: 25 });

      const firstItem: IRoadmapPrivate = res.body.results[0];
      const lastItem: IRoadmapPrivate =
        res.body.results[res.body.results.length - 1];

      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.status).toBe(200);

      expect(res.body.results).toHaveLength(20);
      expect(res.body.roadmaps).toHaveLength(20);
      expect(Array.isArray(res.body.results)).toBeTruthy();
      expect(Array.isArray(res.body.roadmaps)).toBeTruthy();

      expect(res.body.page_info.start_cursor).toBe(firstItem.id);
      expect(res.body.page_info.end_cursor).toBe(lastItem.id);
      expect(res.body.page_info.start_cursor).toBeTypeOf("string");
      expect(res.body.page_info.end_cursor).toBeTypeOf("string");
      expect(res.body.page_info.has_next_page).toBe(true);
      expect(res.body.page_info.end_cursor).not.toBe(
        res.body.page_info.start_cursor,
      );
    });

    it("should throw 'VALIDATION_ERROR' error on '?first=0'", async () => {
      const response = await supertest(app)
        .get("/api/v1/roadmaps")
        .query({ first: 0 });

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(400);

      expect(response.body.code).toBe("VALIDATION_ERROR");
      expect(response.body.errors[0]?.message).toBe(
        "Too small: expected number to be >=1",
      );
    });
  });

  describe("'?after=' param", () => {
    it("should handle cursor pagination correctly", async () => {
      const res1 = await supertest(app)
        .get("/api/v1/roadmaps")
        .query({ first: 3 });
      expect(res1.headers["content-type"]).toContain("application/json");
      const lastId = res1.body.results[2].id;

      const res2 = await supertest(app).get("/api/v1/roadmaps").query({
        first: 3,
        after: lastId,
      });
      expect(res2.headers["content-type"]).toContain("application/json");
      expect(res2.status).toBe(200);
      expect(res2.body.results).toHaveLength(3);
      expect(res2.body.page_info.end_cursor).toBeTypeOf("string");
      expect(res2.body.page_info.start_cursor).toBeTypeOf("string");

      const ids1 = res1.body.results.map((r: IRoadmapPrivate) => r.id);
      const ids2 = res2.body.results.map((r: IRoadmapPrivate) => r.id);
      expect(ids1.some((id: string) => ids2.includes(id))).toBe(false);
    });

    it("should throw 'VALIDATION_ERROR' error for invalid '?after=' param", async () => {
      const res = await supertest(app).get("/api/v1/roadmaps").query({
        after: "invalid-uuid",
      });

      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_ERROR");
      expect(res.body.errors).toBeDefined();
    });

    it("should handle empty '?after=' param gracefully", async () => {
      const res = await supertest(app).get("/api/v1/roadmaps").query({
        after: "",
      });

      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.status).toBe(400);

      expect(res.body.code).toBe("VALIDATION_ERROR");
      expect(res.body.message).toBe("Invalid query parameters");
      expect(res.body.errors?.[0]?.message).toMatch(/invalid uuid/gi);
    });
  });

  describe("'?visibility=' param", () => {
    it("should set default '?visibility=public' without permission", async () => {
      const resPrivate = await supertest(app).get("/api/v1/roadmaps").query({
        visibility: "private",
        first: 10,
      });

      expect(resPrivate.headers["content-type"]).toContain("application/json");
      expect(resPrivate.status).toBe(200);

      expect(Array.isArray(resPrivate.body.results)).toBeTruthy();
      expect(resPrivate.body.total_count).toBeGreaterThanOrEqual(
        resPrivate.body.results.length,
      );

      expect(
        resPrivate.body.results.every(
          (r: IRoadmapPrivate) => r.display === true,
        ),
      ).toBeTruthy();

      // expect(resPrivate.body.total_count).toBe(10);
      // expect(resPrivate.body.page_info.has_next_page).toBe(false);

      const resBoth = await supertest(app).get("/api/v1/roadmaps").query({
        visibility: "public",
        first: 10,
      });
      expect(resBoth.headers["content-type"]).toContain("application/json");
      expect(resBoth.status).toBe(200);

      expect(
        resBoth.body.results.every((r: IRoadmapPrivate) => r.display === true),
      ).toBeTruthy();

      // expect(resBoth.body.total_count).toBe(10);
    });

    it("should get roadmaps '?visibility=public' without permission", async () => {
      const res = await supertest(app)
        .get("/api/v1/roadmaps")
        .query({ visibility: "public" });
      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.status).toBe(200);
      // expect(res.body.total_count).toBe(10);
      expect(
        res.body.results.every((r: IRoadmapPrivate) => r.display === true),
      ).toBeTruthy();
    });

    it("should apply '?visibility=private' filter with permission", async () => {
      const { user } = await createUser({ isVerified: true });
      await createRoleWithPermissions(user.userId, ["roadmap:read"], {
        roleName: "Roadmap Reader",
      });

      const resPrivate = await supertest(app)
        .get("/api/v1/roadmaps")
        .set("Authorization", `Bearer ${user.authToken}`)
        .query({ visibility: "private" });

      expect(resPrivate.headers["content-type"]).toContain("application/json");
      expect(resPrivate.status).toBe(200);
      // expect(resPrivate.body.total_count).toBe(5);
      expect(
        resPrivate.body.results.every(
          (r: IRoadmapPrivate) => r.display === false,
        ),
      ).toBeTruthy();

      const resPublic = await supertest(app)
        .get("/api/v1/roadmaps")
        .set("Authorization", `Bearer ${user.authToken}`)
        .query({ visibility: "public" });

      expect(resPublic.headers["content-type"]).toContain("application/json");
      expect(resPublic.status).toBe(200);
      // expect(resPublic.body.total_count).toBe(10);
      expect(
        resPublic.body.results.every(
          (r: IRoadmapPrivate) => r.display === true,
        ),
      ).toBeTruthy();

      const resBoth = await supertest(app)
        .get("/api/v1/roadmaps")
        .set("Authorization", `Bearer ${user.authToken}`)
        .query({ visibility: "public,private" });

      expect(resBoth.headers["content-type"]).toContain("application/json");
      expect(resBoth.status).toBe(200);
      // expect(resBoth.body.total_count).toBe(15);
    });

    it("should calculate 'has_next_page' correctly with '?visibility=' filters", async () => {
      // Page 1
      const page1 = await supertest(app).get("/api/v1/roadmaps").query({
        first: 6,
      });

      expect(page1.headers["content-type"]).toContain("application/json");
      expect(page1.status).toBe(200);
      expect(page1.body.page_info.count).toBe(6);
      expect(page1.body.page_info.has_next_page).toBe(true);

      // Page 2
      const after = page1.body.page_info.end_cursor;
      const page2 = await supertest(app).get("/api/v1/roadmaps").query({
        first: 6,
        after,
      });

      expect(page2.headers["content-type"]).toContain("application/json");
      expect(page2.status).toBe(200);
      // remaining 4 public
      // expect(page2.body.page_info.count).toBe(4);
      // expect(page2.body.page_info.has_next_page).toBe(false);
    });
  });
});

// Get roadmaps by URL
describe("GET /api/v1/roadmaps/:url", () => {
  [
    "ROADMAP_NOT_FOUND",
    "undefined",
    "null",
    null,
    undefined,
    "roadmap name with spaces",
    "roadmap+with+plus",
    "roadmap#with#hash",
    "456575634",
  ].map((name) =>
    it(`should throw error "ROADMAP_NOT_FOUND" for '${name}'`, async () => {
      const res = await supertest(app).get(`/api/v1/roadmaps/${name}`);

      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.status).toBe(404);
      expect(res.body.code).toBe("ROADMAP_NOT_FOUND");
    }),
  );

  ["*&^(*&$%&*^&%&^%*"].map((name) =>
    it(`should throw error "DECODE_URI_ERROR" for '${name}' roadmap`, async () => {
      const { user } = await createUser({
        isVerified: true,
      });
      await createRoleWithPermissions(user.userId, ["roadmap:read"], {
        roleName: "Roadmap Reader",
      });

      const response = await supertest(app)
        .get(`/api/v1/roadmaps/search/${name}`)
        .set("Authorization", `Bearer ${user.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");

      expect(response.status).toBe(400);
      expect(response.body.code).toBe("DECODE_URI_ERROR");
    }),
  );

  it("should get roadmap by url", async () => {
    const roadmapUrl = faker.commerce
      .productName()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .substring(0, 50)
      .replace(/^-+|-+$/g, "");
    const roadmap = await generateRoadmap(
      {
        url: roadmapUrl,
      },
      true,
    );

    const res = await supertest(app).get(`/api/v1/roadmaps/${roadmapUrl}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(200);

    const body = res.body as IGetRoadmapByUrlResponseBody;

    expect(body.roadmap).not.toBeNull();
    expect(body.roadmap).not.toBeUndefined();

    expect(body.roadmap.id).toBe(roadmap.id);
    expect(body.roadmap.name).toBe(roadmap.name);
    expect(body.roadmap.url).toBe(roadmap.url);
    expect(body.roadmap.index).toBe(roadmap.index);
    expect(body.roadmap.display).toBe(roadmap.display);
    expect(body.roadmap.color).toBe(roadmap.color);
    expect(body.roadmap.created_at).toBe(roadmap.created_at);
  });
});

// Search roadmaps by name
describe("GET /api/v1/roadmaps/search/:name", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).get(
      "/api/v1/roadmaps/search/completed",
    );

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw error not having 'roadmap:read' permission", async () => {
    const { user: authUser } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .get("/api/v1/roadmaps/search/completed")
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  ["ROADMAP_NOT_FOUND", "undefined", "null", null, undefined, "456575634"].map(
    (name) =>
      it(`should get 0 search results for "${name}" roadmaps`, async () => {
        const { user } = await createUser({
          isVerified: true,
        });
        await createRoleWithPermissions(user.userId, ["roadmap:read"], {
          roleName: "Roadmap Reader",
        });

        const response = await supertest(app)
          .get(`/api/v1/roadmaps/search/${name}`)
          .set("Authorization", `Bearer ${user.authToken}`);

        expect(response.body.roadmaps).toStrictEqual([]);
        expect(response.body.roadmaps).toHaveLength(0);

        expect(response.headers["content-type"]).toContain("application/json");
        expect(response.status).toBe(200);
      }),
  );

  ["*&^(*&$%&*^&%&^%*"].map((name) =>
    it(`should get 0 search results for "${name}" roadmaps`, async () => {
      const { user } = await createUser({
        isVerified: true,
      });
      await createRoleWithPermissions(user.userId, ["roadmap:read"], {
        roleName: "Roadmap Reader",
      });

      const response = await supertest(app)
        .get(`/api/v1/roadmaps/search/${name}`)
        .set("Authorization", `Bearer ${user.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(400);
      expect(response.body.code).toBe("DECODE_URI_ERROR");
    }),
  );

  const roadmapName = faker.commerce
    .productName()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .substring(0, 50)
    .replace(/^-+|-+$/g, "");
  it(`should show 2 "${roadmapName}" matching roadmaps`, async () => {
    const r1 = await generateRoadmap(
      {
        name: `${roadmapName}_first`,
      },
      true,
    );
    const r2 = await generateRoadmap(
      {
        name: `${roadmapName}_two`,
      },
      true,
    );

    const { user } = await createUser({
      isVerified: true,
    });
    await createRoleWithPermissions(user.userId, ["roadmap:read"], {
      roleName: "Roadmap Reader",
    });

    const response = await supertest(app)
      .get(`/api/v1/roadmaps/search/${roadmapName}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    const roadmaps = response.body.roadmaps;
    expect(roadmaps).toHaveLength(2);

    expect(roadmaps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: r1.id,
          name: r1.name,
          url: r1.url,
          color: r1.color,
          display: r1.display,
          index: r1.index,
        }),
        expect.objectContaining({
          id: r2.id,
          name: r2.name,
          url: r2.url,
          color: r2.color,
          display: r2.display,
          index: r2.index,
        }),
      ]),
    );

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
  });
});

// Create new roadmaps
describe("POST /api/v1/roadmaps", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const res = await supertest(app).post("/api/v1/roadmaps");

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw error not having 'roadmap:create' permission", async () => {
    const { user: authUser } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .post("/api/v1/roadmaps")
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  it("should create private roadmap with default values", async () => {
    const { user } = await createUser({
      isVerified: true,
    });
    await createRoleWithPermissions(user.userId, ["roadmap:create"], {
      roleName: "Roadmap Creator",
    });

    const response = await supertest(app)
      .post("/api/v1/roadmaps")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(201);

    const roadmap = response.body.roadmap;

    expect(roadmap.name).toBe("new roadmap");
    expect(roadmap.url).toContain("new-roadmap-");
    expect(roadmap.display).toBeFalsy();

    expect(roadmap.id).toBeDefined();
    expect(roadmap.color).toBeDefined();
    expect(roadmap.index).toBeDefined();
    expect(roadmap.created_at).toBeDefined();
  });
});

// Update roadmaps
describe("PATCH /api/v1/roadmaps", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const res = await supertest(app).patch("/api/v1/roadmaps");

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw error not having 'roadmap:update' permission", async () => {
    const { user: authUser } = await createUser({
      isVerified: true,
    });
    const r1 = await generateRoadmap({}, true);

    const response = await supertest(app)
      .patch("/api/v1/roadmaps")
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        id: r1.id,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toEqual("NOT_ENOUGH_PERMISSION");
  });

  it('should throw error "ROADMAP_URL_MISSING"', async () => {
    const { user } = await createUser({
      isVerified: true,
    });
    await createRoleWithPermissions(user.userId, ["roadmap:update"], {
      roleName: "Roadmap update",
    });
    const r1 = await generateRoadmap({}, true);

    const response = await supertest(app)
      .patch("/api/v1/roadmaps")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        id: r1.id,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "ROADMAP_URL_MISSING",
        }),
      ]),
    );
  });

  it("should update roadmap", async () => {
    const { user } = await createUser({
      isVerified: true,
    });
    await createRoleWithPermissions(user.userId, ["roadmap:update"], {
      roleName: "Roadmap update",
    });

    const r1 = await generateRoadmap({}, true);
    const name = "Roadmap updated!";

    const response = await supertest(app)
      .patch("/api/v1/roadmaps")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        id: r1.id,
        name,
        url: r1.url,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);

    const roadmap = response.body.roadmap;
    expect(roadmap.id).toBe(r1.id);
    expect(roadmap.name).toBe(name);
    expect(roadmap.url).toBe(r1.url);
    expect(roadmap.color).toBe(r1.color);
    expect(roadmap.display).toBe(r1.display);
    expect(roadmap.index).toBe(r1.index);
    expect(roadmap.created_at).toBe(r1.created_at);
  });
});

// Delete roadmaps
describe("DELETE /api/v1/roadmaps/", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const res = await supertest(app).delete("/api/v1/roadmaps");

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw error not having 'roadmap:destroy' permission", async () => {
    const { user: authUser } = await createUser({
      isVerified: true,
    });
    const r1 = await generateRoadmap({}, true);

    const response = await supertest(app)
      .delete("/api/v1/roadmaps")
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        id: r1.id,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  it('should throw error "ROADMAP_NOT_FOUND"', async () => {
    const { user } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .delete("/api/v1/roadmaps")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        id: uuid(),
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("ROADMAP_NOT_FOUND");
  });

  it("should delete roadmap", async () => {
    const { user } = await createUser({
      isVerified: true,
    });
    await createRoleWithPermissions(user.userId, ["roadmap:destroy"], {
      roleName: "Roadmap delete",
    });
    const r1 = await generateRoadmap({}, true);

    const response = await supertest(app)
      .delete("/api/v1/roadmaps")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        id: r1.id,
      });

    expect(response.status).toBe(204);
  });
});

// TODO: Sort roadmaps
