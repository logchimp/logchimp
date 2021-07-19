const supertest = require("supertest");
const { v4: uuid } = require("uuid");
const jwt = require('jsonwebtoken');

const app = require("../../../../server");
const database = require("../../../../server/database");
const { hashPassword } = require("../../../../server/helpers");
const { verifyToken } = require('../../../../server/services/token.service');

beforeAll(async () => {
	await database.migrate.latest();
	await database
		.insert([
			{
				userId: uuid(),
				email: "userExists@example.com",
				password: hashPassword("strongPassword"),
				username: "userExists"
			}
		])
		.into("users");
});

afterAll(async () => {
	return await database.migrate.rollback();
});

describe("POST /api/v1/auth/login", () => {
	it("should throw error \"EMAIL_INVALID\"", async () => {
		const response = await supertest(app).post("/api/v1/auth/login");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(400);
		expect(response.body.code).toBe("EMAIL_INVALID");
	});

	it("should throw error \"USER_NOT_FOUND\"", async () => {
		const response = await supertest(app).post("/api/v1/auth/login").send({
			email: "user_not_found@example.com"
		});

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(404);
		expect(response.body.code).toBe("USER_NOT_FOUND");
	});

	it("should throw error \"PASSWORD_MISSING\"", async () => {
		const response = await supertest(app).post("/api/v1/auth/login").send({
			email: "userExists@example.com",
			password: ""
		});

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(400);
		expect(response.body.code).toBe("PASSWORD_MISSING");
	});

	it("should throw error \"INCORRECT_PASSWORD\"", async () => {
		const response = await supertest(app).post("/api/v1/auth/login").send({
			email: "userExists@example.com",
			password: "incorrect_password"
		});

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(403);
		expect(response.body.code).toBe("INCORRECT_PASSWORD");
	});

	it("should get user data", async () => {
		const response = await supertest(app).post("/api/v1/auth/login").send({
			email: "userExists@example.com",
			password: "strongPassword"
		});

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(200);

		const user = response.body.user;
		const token = verifyToken(user.authToken);

		// check auth token
		expect(token.email).toEqual("userExists@example.com");
		expect(token.userId).toEqual(user.userId);

		expect(user.email).toEqual("userExists@example.com");
		expect(user.avatar).toBeNull();
		expect(user.name).toBeNull();
		expect(user.password).toBeUndefined();
	});
});
