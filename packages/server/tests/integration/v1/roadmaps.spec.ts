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
    expect(response.body.data).toHaveLength(0); // Changed from 'roadmaps' to 'data'
  });
});

// Get roadmaps by URL
describe("GET /roadmaps/:url", () => {
  it('should throw error "ROADMAP_NOT_FOUND"', async () => {
    const response = await supertest(app).get("/api/v1/roadmaps/do_not_exists");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toEqual("ROADMAP_NOT_FOUND");
  });

  it("should get roadmap by url", async () => {
    // generate & add roadmap
    const roadmap = generateRoadmap();
    roadmap.url = "create-existing-roadmap";

    await database.insert(roadmap).into("roadmaps");

    const response = await supertest(app).get(
      "/api/v1/roadmaps/create-existing-roadmap",
    );

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.roadmap).toStrictEqual(roadmap);
  });
});

// Create new roadmaps
describe("POST /api/v1/roadmaps", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).post("/api/v1/roadmaps");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual("INVALID_AUTH_HEADER");
  });
});

// Pagination tests
describe("GET /api/v1/roadmaps pagination", () => {
  beforeAll(async () => {
    // Clear existing data first
    await database("roadmaps").truncate();
    // Seed 15 roadmaps for predictable counts
    for (let i = 0; i < 15; i++) {
      await database.insert(generateRoadmap()).into("roadmaps");
    }
  });

  afterAll(async () => {
    await database("roadmaps").truncate();
  });

  it("returns default 20 items when no first param", async () => {
    const res = await supertest(app).get("/api/v1/roadmaps");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(15); // We only have 15 items
    expect(res.body.page_info.has_next_page).toBe(false);
    expect(res.body.total_count).toBe(15);
  });

  it("returns 5 items and correct meta structure", async () => {
    const res = await supertest(app).get("/api/v1/roadmaps?first=5");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.page_info.has_next_page).toBe(true);
    expect(res.body.page_info.count).toBe(5);
    expect(res.body.total_count).toBe(15);
    expect(res.body.total_pages).toBe(3);
  });

  it("handles cursor pagination correctly", async () => {
    // Get first page
    const res1 = await supertest(app).get("/api/v1/roadmaps?first=3");
    expect(res1.status).toBe(200);
    expect(res1.body.data).toHaveLength(3);

    // Get second page using last item's ID as cursor
    const lastItem = res1.body.data[res1.body.data.length - 1];
    const res2 = await supertest(app).get(`/api/v1/roadmaps?first=3&after=${lastItem.id}`);

    expect(res2.status).toBe(200);
    expect(res2.body.data).toHaveLength(3);

    // Verify no overlap between pages
    const ids1 = res1.body.data.map(item => item.id);
    const ids2 = res2.body.data.map(item => item.id);
    expect(ids1.some(id => ids2.includes(id))).toBe(false);
  });

  it("returns 400 for invalid first parameter", async () => {
    const res = await supertest(app).get("/api/v1/roadmaps?first=999");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR'); // Updated to match controller error
    expect(res.body.errors).toBeDefined(); // Should be 'errors' (which contains 'issues')
  });

  it("returns 400 for invalid after parameter", async () => {
    const res = await supertest(app).get("/api/v1/roadmaps?after=invalid-uuid");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(res.body.errors).toBeDefined();
  });

  it("handles empty cursor parameter gracefully", async () => {
    const res = await supertest(app).get("/api/v1/roadmaps?after=");
    expect(res.status).toBe(200); // Should work fine with empty after param
  });

  it("returns correct pagination info for last page", async () => {
    // Get a page that should be the last page
    const res = await supertest(app).get("/api/v1/roadmaps?first=20");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(15); // All items fit in one page
    expect(res.body.page_info.has_next_page).toBe(false);
    expect(res.body.total_count).toBe(15);
  });

  it("handles first parameter edge cases", async () => {
    // Test minimum value
    const res1 = await supertest(app).get("/api/v1/roadmaps?first=1");
    expect(res1.status).toBe(200);
    expect(res1.body.data).toHaveLength(1);

    // Test maximum value
    const res2 = await supertest(app).get("/api/v1/roadmaps?first=100");
    expect(res2.status).toBe(200);
    expect(res2.body.data).toHaveLength(15); // Only 15 items exist

    // Test invalid values
    const res3 = await supertest(app).get("/api/v1/roadmaps?first=0");
    expect(res3.status).toBe(400);
    expect(res3.body.code).toBe('VALIDATION_ERROR');
  });
});
