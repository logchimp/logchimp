import { it, expect } from "vitest";
import app from "../../src/app";
import supertest from "supertest";

it("GET /api", async () => {
  const response = await supertest(app).get("/api");

  expect(response.headers["content-type"]).toContain("text/html");
  expect(response.status).toBe(200);
  expect(response.text).toBe("👍");
});

// test("POST /api", async () => {
// 	const response = await supertest(app).post("/api");

// 	expect(response.headers["content-type"]).toContain("application/json");
// 	expect(response.body.code).toBe("ROUTE_NOT_FOUND");
// });
