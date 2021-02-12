const app = require("../../server/app");
const supertest = require("supertest");

test("ping /api", async () => {
	const response = await supertest(app).get("/api");

	expect(response.headers["content-type"]).toContain("text/html");
	expect(response.status).toBe(200);
	expect(response.text).toBe("👍");
});
