import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import { faker } from "@faker-js/faker";
import { v4 as uuid } from "uuid";
import type { IGetRoadmapByUrlResponseBody } from "@logchimp/types";

import app from "../../../src/app";
import { roadmap as generateRoadmap } from "../../utils/generators";
import database from "../../../src/database";
import { cleanDb } from "../../utils/db";
import { createUser } from "../../utils/seed/user";
import { createRoleWithPermissions } from "../../utils/createRoleWithPermissions";

// Get all roadmaps
describe("GET /api/v1/roadmaps", () => {
  beforeEach(async () => {
    await cleanDb();
    await database.transaction(async (trx) => {
      for (let i = 0; i < 15; i++) {
        const r = await generateRoadmap();
        await trx.insert(r).into("roadmaps");
      }
    });
  });

  it("should get 0 roadmaps", async () => {
    await cleanDb();

    const response = await supertest(app).get("/api/v1/roadmaps");

    expect(response.headers["content-type"]).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(0);
    expect(response.body.roadmaps).toHaveLength(0);
  });

  it("returns default list when no first param", async () => {
    const res = await supertest(app).get("/api/v1/roadmaps");

    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(15);
    expect(res.body.roadmaps).toHaveLength(15);
    expect(res.body.page_info.has_next_page).toBe(false);
    expect(res.body.page_info.end_cursor).toBeTypeOf("string");
    expect(res.body.page_info.start_cursor).toBeTypeOf("string");
    expect(res.body.total_count).toBe(15);
  });

  it("returns 5 items with correct meta", async () => {
    const res = await supertest(app).get("/api/v1/roadmaps?first=5");

    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(5);
    expect(res.body.roadmaps).toHaveLength(5);
    expect(res.body.page_info.count).toBe(5);
    expect(res.body.page_info.has_next_page).toBe(true);
    expect(res.body.page_info.end_cursor).toBeTypeOf("string");
    expect(res.body.page_info.start_cursor).toBeTypeOf("string");
    expect(res.body.page_info.end_cursor).not.toBe(
      res.body.page_info.start_cursor,
    );
    expect(res.body.total_pages).toBe(3);
    expect(res.body.total_count).toBe(15);
  });

  it("handles cursor pagination correctly", async () => {
    const res1 = await supertest(app).get("/api/v1/roadmaps?first=3");
    const lastId = res1.body.results[2].id;

    const res2 = await supertest(app).get(
      `/api/v1/roadmaps?first=3&after=${lastId}`,
    );

    expect(res2.status).toBe(200);
    expect(res2.body.results).toHaveLength(3);
    expect(res2.body.page_info.end_cursor).toBeTypeOf("string");
    expect(res2.body.page_info.start_cursor).toBeTypeOf("string");

    const ids1 = res1.body.results.map((r) => r.id);
    const ids2 = res2.body.results.map((r) => r.id);
    expect(ids1.some((id: string) => ids2.includes(id))).toBe(false);
  });

  it("returns 400 for first > 20", async () => {
    const res = await supertest(app).get("/api/v1/roadmaps?first=21");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
    expect(res.body.errors).toBeDefined();
  });

  it("returns 400 for invalid after parameter", async () => {
    const res = await supertest(app).get("/api/v1/roadmaps?after=invalid-uuid");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
    expect(res.body.errors).toBeDefined();
  });

  it("handles empty after param gracefully", async () => {
    const res = await supertest(app).get("/api/v1/roadmaps?after=");

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
    expect(res.body.message).toBe("Invalid query parameters");

    // invalid ?=after query param
    expect(res.body.errors[0].message).toBe("Invalid UUID");
  });

  it("returns correct info for last page", async () => {
    const res = await supertest(app).get("/api/v1/roadmaps?first=20");

    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(15);
    expect(res.body.page_info.has_next_page).toBe(false);
    expect(res.body.page_info.end_cursor).toBeTypeOf("string");
    expect(res.body.page_info.start_cursor).toBeTypeOf("string");
    expect(res.body.total_count).toBe(15);
  });

  it("edge cases for first param", async () => {
    const min = await supertest(app).get("/api/v1/roadmaps?first=1");
    expect(min.body.results).toHaveLength(1);
    expect(min.body.page_info.end_cursor).toBeTypeOf("string");
    expect(min.body.page_info.start_cursor).toBeTypeOf("string");

    const max = await supertest(app).get("/api/v1/roadmaps?first=20");
    expect(max.body.results).toHaveLength(15);

    const zero = await supertest(app).get("/api/v1/roadmaps?first=0");
    expect(zero.status).toBe(400);
    expect(zero.body.code).toBe("VALIDATION_ERROR");
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
    "456575634",
    // TODO: add this test case - not working for some reason
    // "*&^(*&$%&*^&%&^%*",
  ].map((name) =>
    it(`should throw error "ROADMAP_NOT_FOUND" for '${name}'`, async () => {
      const res = await supertest(app).get(`/api/v1/roadmaps/${name}`);

      expect(res.status).toBe(404);
      expect(res.body.code).toBe("ROADMAP_NOT_FOUND");
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

    expect(response.headers["content-type"]).toBe("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it('should throw error "NOT_ENOUGH_PERMISSION"', async () => {
    const { user: authUser } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .get("/api/v1/roadmaps/search/completed")
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toBe("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  it('should get 0 search results for "randooo" roadmaps', async () => {
    const { user } = await createUser({
      isVerified: true,
    });
    await createRoleWithPermissions(user.userId, ["roadmap:read"], {
      roleName: "Roadmap Reader",
    });

    const response = await supertest(app)
      .get("/api/v1/roadmaps/search/randooo")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.body.roadmaps).toStrictEqual([]);
    expect(response.body.roadmaps).toHaveLength(0);

    expect(response.headers["content-type"]).toBe("application/json");
    expect(response.status).toBe(200);
  });

  const roadmapName = faker.commerce
    .productName()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .substring(0, 50)
    .replace(/^-+|-+$/g, "");
  it(`should show "${roadmapName}" roadmaps`, async () => {
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
    expect(response.body.roadmaps).toHaveLength(2);

    // r1
    expect(roadmaps[0].id).toBe(r1.id);
    expect(roadmaps[0].name).toBe(r1.name);
    expect(roadmaps[0].url).toBe(r1.url);
    expect(roadmaps[0].color).toBe(r1.color);
    expect(roadmaps[0].display).toBe(r1.display);
    expect(roadmaps[0].index).toBe(r1.index);

    // r2
    expect(roadmaps[1].id).toBe(r2.id);
    expect(roadmaps[1].name).toBe(r2.name);
    expect(roadmaps[1].url).toBe(r2.url);
    expect(roadmaps[1].color).toBe(r2.color);
    expect(roadmaps[1].display).toBe(r2.display);
    expect(roadmaps[1].index).toBe(r2.index);

    expect(response.headers["content-type"]).toBe("application/json");
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

  it('should throw error "NOT_ENOUGH_PERMISSION"', async () => {
    const { user: authUser } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .post("/api/v1/roadmaps")
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toBe("application/json");
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

    expect(response.headers["content-type"]).toBe("application/json");
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

  it('should throw error "NOT_ENOUGH_PERMISSION"', async () => {
    const { user: authUser } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .patch("/api/v1/roadmaps")
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toBe("application/json");
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

    expect(response.headers["content-type"]).toBe("application/json");
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

    expect(response.headers["content-type"]).toBe("application/json");
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

  it('should throw error "NOT_ENOUGH_PERMISSION"', async () => {
    const { user: authUser } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .delete("/api/v1/roadmaps")
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toBe("application/json");
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

    expect(response.headers["content-type"]).toBe("application/json");
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
