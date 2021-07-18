const supertest = require("supertest");
const { v4: uuidv4 } = require("uuid");

const app = require("../../../../server");
const database = require("../../../../server/database");
const { hashPassword } = require("../../../../server/utils/password");

beforeAll(async () => {
	return await database.migrate.latest();
});

afterAll(async () => {
	return await database.migrate.rollback();
});

describe("POST /api/v1/auth/login", () => {
	it('should throw error "EMAIL_INVALID"', async () => {
		const response = await supertest(app).post("/api/v1/auth/login");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(400);
		expect(response.body.code).toBe("EMAIL_INVALID");
	});

	it('should throw error "USER_NOT_FOUND"', async () => {
		const response = await supertest(app).post("/api/v1/auth/login").send({
			email: "user_not_found@example.com"
		});

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(404);
		expect(response.body.code).toBe("USER_NOT_FOUND");
	});

	describe("password error", () => {
		beforeAll(async () => {
			// seed a user
			const password = hashPassword("strongPassword");

			return await database
				.insert({
					userId: uuidv4(),
					email: "userExists@example.com",
					password,
					username: "userExists"
				})
				.into("users");
		});

		it("error: password missing", async () => {
			const response = await supertest(app).post("/api/v1/auth/login").send({
				email: "userExists@example.com",
				password: ""
			});

			expect(response.headers["content-type"]).toContain("application/json");
			expect(response.status).toBe(400);
			expect(response.body.errors[0].code).toBe("PASSWORD_MISSING");
		});

		it("error: incorrect password", async () => {
			const response = await supertest(app).post("/api/v1/auth/login").send({
				email: "userExists@example.com",
				password: "incorrect_password"
			});

			expect(response.headers["content-type"]).toContain("application/json");
			expect(response.status).toBe(403);
			expect(response.body.code).toBe("INCORRECT_PASSWORD");
		});
	});

	it("get user data", async () => {
		const response = await supertest(app).post("/api/v1/auth/login").send({
			email: "userExists@example.com",
			password: "strongPassword"
		});

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(200);

		const userObject = response.body.user;
		expect(userObject.authToken).toBeDefined();
		expect(userObject.userId).toBeDefined();
		expect(userObject.name).toBeNull();
		expect(userObject.username).toBe("userExists");
		expect(userObject.email).toBe("userExists@example.com");
		expect(userObject.avatar).toBeNull();
		expect(userObject.password).toBeUndefined();
	});
});
