const app = require("../../../../server");
const supertest = require("supertest");

const database = require("../../../utils/setupDatabase");

beforeAll(async () => {
	return await database.latest();
});

afterAll(async () => {
	return await database.rollback();
});

describe("signup", () => {
	it("error: email missing", async () => {
		const response = await supertest(app).post("/api/v1/auth/signup");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(400);
		expect(response.body.code).toBe("EMAIL_INVALID");
	});

	it("error: password missing", async () => {
		const response = await supertest(app).post("/api/v1/auth/signup").send({
			email: "signup_email@example.com"
		});

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(400);
		expect(response.body.code).toBe("PASSWORD_MISSING");
	});

	it("should create new user", async () => {
		const response = await supertest(app).post("/api/v1/auth/signup").send({
			email: "user@example.com",
			password: "password"
		});

		const user = response.body.user;
		expect(response.status).toBe(201);
		expect(user).toMatchObject({
      name: null,
      username: 'user',
      email: 'user@example.com',
    })
	})
	it("should not create new user with different casing in email", async () => {
		await supertest(app).post("/api/v1/auth/signup").send({
			email: "user1@example.com",
			password: "password"
		});

		const response = await supertest(app).post("/api/v1/auth/signup").send({
			email: "USER1@example.com",
			password: "password"
		});
		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(409);
		expect(response.body.code).toBe("USER_EXISTS");
	})

	it("should not be allowed", async () => {
		// set allowSignup to false in settings table
		await database.instance.update({
			allowSignup: false,
		})
		.from("settings");

		const response = await supertest(app).post("/api/v1/auth/signup").send({
			email: "user@example.com",
			password: "password"
		});

		expect(response.status).toBe(400);
		expect(response.body.code).toBe("SIGNUP_NOT_ALLOWED");
	})
});

