import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";

import app from "../../../src/app";
import { roadmap as generateRoadmap } from "../../utils/generators";
import database from "../../../src/database";

// Get all roadmaps
describe("GET /api/v1/roadmaps", () => {
  it("should get 0 roadmaps", async () => {
    const response = await supertest(app).get("/api/v1/roadmaps");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.roadmaps).toHaveLength(0); // back-compat field
    expect(response.body.data).toHaveLength(0);     // new field
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
      "/api/v1/roadmaps/create-existing-roadmap"
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

// Pagination tests
describe("GET /api/v1/roadmaps pagination", () => {
  beforeAll(async () => {
    await database("roadmaps").truncate();
    for (let i = 0; i < 15; i++) {
      await database.insert(generateRoadmap()).into("roadmaps");
    }
  });

  afterAll(async () => {
    await database("roadmaps").truncate();
  });

  it("returns default list when no first param", async () => {
    const res = await supertest(app).get("/api/v1/roadmaps");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(15);
    expect(res.body.roadmaps).toHaveLength(15);
    expect(res.body.page_info.has_next_page).toBe(false);
    expect(res.body.total_count).toBe(15);
  });

  it("returns 5 items with correct meta", async () => {
    const res = await supertest(app).get("/api/v1/roadmaps?first=5");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.roadmaps).toHaveLength(5);
    expect(res.body.page_info.count).toBe(5);
    expect(res.body.page_info.has_next_page).toBe(true);
    expect(res.body.total_pages).toBe(3);
    expect(res.body.total_count).toBe(15);
  });

  it("handles cursor pagination correctly", async () => {
    const res1 = await supertest(app).get("/api/v1/roadmaps?first=3");
    const lastId = res1.body.data[2].id;

    const res2 = await supertest(app).get(
      `/api/v1/roadmaps?first=3&after=${lastId}`
    );

    expect(res2.status).toBe(200);
    expect(res2.body.data).toHaveLength(3);

    const ids1 = res1.body.data.map((r) => r.id);
    const ids2 = res2.body.data.map((r) => r.id);
    expect(ids1.some((id) => ids2.includes(id))).toBe(false);
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
    expect(res.status).toBe(200);
  });

  it("returns correct info for last page", async () => {
    const res = await supertest(app).get("/api/v1/roadmaps?first=20");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(15);
    expect(res.body.page_info.has_next_page).toBe(false);
    expect(res.body.total_count).toBe(15);
  });

  it("edge cases for first param", async () => {
    const min = await supertest(app).get("/api/v1/roadmaps?first=1");
    expect(min.body.data).toHaveLength(1);

    const max = await supertest(app).get("/api/v1/roadmaps?first=20");
    expect(max.body.data).toHaveLength(15);

    const zero = await supertest(app).get("/api/v1/roadmaps?first=0");
    expect(zero.status).toBe(400);
    expect(zero.body.code).toBe("VALIDATION_ERROR");
  });
});
