const app = require("../../app");
const supertest = require("supertest");

test("GET /api", async () => {
	const response = await supertest(app).get("/api");

	expect(response.headers["content-type"]).toContain("text/html");
	expect(response.status).toEqual(200);
	expect(response.text).toBe("👍");
});

// test("POST /api", async () => {
// 	const response = await supertest(app).post("/api");

// 	expect(response.headers["content-type"]).toContain("application/json");
// 	expect(response.body.code).toEqual("ROUTE_NOT_FOUND");
// });
