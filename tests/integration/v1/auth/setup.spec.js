const app = require("../../../../server");
const supertest = require("supertest");

const database = require("../../../utils/setupDatabase");

beforeAll(async () => {
	return await database.latest();
});

afterAll(async () => {
	return await database.rollback();
});

describe("setup", () => {
	it("error: email missing", async () => {
		const response = await supertest(app).post("/api/v1/auth/setup");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(400);
		expect(response.body.code).toBe("EMAIL_MISSING");
	});

	it("error: password missing", async () => {
		const response = await supertest(app).post("/api/v1/auth/setup").send({
			email: "admin@example.com"
		});

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(400);
		expect(response.body.code).toBe("PASSWORD_MISSING");
	});
});
