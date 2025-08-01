import { describe, it, expect, beforeAll, afterAll } from "vitest";import supertest from "supertest";

import app from "../../../src/app";
import { roadmap as generateRoadmap } from "../../utils/generators";
import database from "../../../src/database";

// Get all roadmaps
describe("GET /api/v1/roadmaps", () => {
  it("should get 0 roadmaps", async () => {
    const response = await supertest(app).get("/api/v1/roadmaps");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.roadmaps).toHaveLength(0);
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
// pagination tests
describe("GET /api/v1/roadmaps pagination", () => {
  beforeAll(async () => {
    // seed 10 roadmaps for predictable counts
    for (let i = 0; i < 10; i++) {
      await database.insert(generateRoadmap()).into("roadmaps");
    }
  });

  afterAll(async () => {
    await database("roadmaps").truncate();
  });

  it("returns 5 items and correct meta structure", async () => {
    const res = await supertest(app).get("/api/v1/roadmaps?first=5");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.page_info.has_next_page).toBe(true);
    expect(res.body.total_count).toBeGreaterThanOrEqual(5);
  });

  it("returns 400 for invalid first", async () => {
    const res = await supertest(app).get("/api/v1/roadmaps?first=999");
    expect(res.status).toBe(400);
  });
});
