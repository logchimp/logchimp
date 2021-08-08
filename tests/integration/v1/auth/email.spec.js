const supertest = require("supertest");

const app = require("../../../../server");
const database = require("../../../../server/database");
const { createToken } = require("../../../../server/services/token.service");

beforeAll(async () => {
	return await database.migrate.latest();
});

afterAll(async () => {
	return await database.migrate.rollback();
});

describe("POST /api/v1/auth/email/validate", () => {
	it("should throw error \"MISSING_TOKEN\"", async () => {
		const response = await supertest(app).post("/api/v1/auth/email/validate");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(400);
		expect(response.body.errors[0].code).toBe("MISSING_TOKEN");
	});

	it("should throw error \"INVALID_TOKEN\"", async () => {
    const tokenPayload = {
			userId: "601db0cd-ba5b-480d-a62b-06c8dcb72267",
			email: "mittalyashu77@gmail.com",
			type: "emailVerification"
		};

    const token = createToken(tokenPayload, {
      expiresIn: "2h"
    });

		const response = await supertest(app).post("/api/v1/auth/email/validate").send({
			token
		});

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(404);
		expect(response.body.code).toBe("INVALID_TOKEN");
	});


});
