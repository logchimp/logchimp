import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";

import app from "../../../src/app";
import { roadmap as generateRoadmap } from "../../utils/generators";
import database from "../../../src/database";
import { cleanDb } from "../../utils/db";

// Get all roadmaps
describe("GET /api/v1/roadmaps", () => {
  beforeEach(async () => {
    await cleanDb();
    await database.transaction(async (trx) => {
      for (let i = 0; i < 15; i++) {
        await trx.insert(generateRoadmap()).into("roadmaps");
      }
    });
  });

  it("should get 0 roadmaps", async () => {
    await cleanDb();

    const response = await supertest(app).get("/api/v1/roadmaps");

    expect(response.headers["content-type"]).toContain("application/json");
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
    expect(res.body.code).toEqual("VALIDATION_ERROR");
    expect(res.body.message).toEqual("Invalid query parameters");

    // invalid ?=after query param
    expect(res.body.errors[0].message).toEqual("Invalid UUID");
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
describe("GET /roadmaps/:url", () => {
  it('should throw error "ROADMAP_NOT_FOUND"', async () => {
    const res = await supertest(app).get("/api/v1/roadmaps/do_not_exists");

    expect(res.status).toBe(404);
    expect(res.body.code).toEqual("ROADMAP_NOT_FOUND");
  });

  it("should get roadmap by url", async () => {
    const roadmap = generateRoadmap();
    roadmap.url = "create-existing-roadmap";
    await database.insert(roadmap).into("roadmaps");

    const res = await supertest(app).get(
      "/api/v1/roadmaps/create-existing-roadmap",
    );

    expect(res.status).toBe(200);
    expect(res.body.roadmap).toStrictEqual(roadmap);
  });
});

// Create new roadmaps
describe("POST /api/v1/roadmaps", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const res = await supertest(app).post("/api/v1/roadmaps");

    expect(res.status).toBe(400);
    expect(res.body.code).toEqual("INVALID_AUTH_HEADER");
  });
});
