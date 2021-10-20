const supertest = require("supertest");
const { v4: uuid } = require("uuid");

const app = require("../../../server");
const database = require("../../../server/database");
const { hashPassword } = require("../../../server/helpers");
const { board: generateBoards } = require("../../utils/generators");
const { getUser } = require("../../utils/getUser");
const cleanDatabase = require("../../../utils/cleanDatabase");

afterAll(() => cleanDatabase());

// Get all boards
describe("GET /api/v1/boards", () => {
	it("should get 0 boards", async () => {
		const response = await supertest(app).get("/api/v1/boards");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(200);
		expect(response.body.boards).toHaveLength(0);
	});

	it.only("should get 0 boards", async () => {
		const response = await supertest(app).get("/api/v1/boards");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(200);
		expect(response.body.boards).toHaveLength(0);
	});
});

// Get boards by URL
describe("GET /boards/:url", () => {
	it('should throw error "BOARD_NOT_FOUND"', async () => {
		const response = await supertest(app).get("/api/v1/boards/do_not_exists");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(404);
		expect(response.body.code).toEqual("BOARD_NOT_FOUND");
	});

	it("should get board by url", async () => {
		// generate & add board
		const board = generateBoards();
		board.url = "create-existing-board";

		await database.insert(board).into("boards");

		const response = await supertest(app).get(
			"/api/v1/boards/create-existing-board"
		);

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(200);
		expect(response.body.board).toStrictEqual(board);
	});
});

// Search board by name
describe("GET /boards/search/:name", () => {
	it('should throw error "INVALID_AUTH_HEADER"', async () => {
		const response = await supertest(app).get("/api/v1/boards/search/name");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(400);
		expect(response.body.code).toEqual("INVALID_AUTH_HEADER");
	});

	it("should throw error not having 'board:read' permission", async () => {
		// seed users with no "board:read permission"
		const createUser = await database
			.insert([
				{
					userId: uuid(),
					email: "no-permission@example.com",
					password: hashPassword("strongPassword"),
					username: "no-permission"
				}
			])
			.into("users")
			.returning(["userId"]);

		// assign '@everyone' role to user
		await database.raw(
			`
			INSERT INTO roles_users (id, role_id, user_id)
			VALUES(:uuid, (
					SELECT
						id FROM roles
					WHERE
						name = '@everyone'
					), :userId)
		`,
			{
				uuid: uuid(),
				userId: createUser[0].userId
			}
		);

		const authUser = await getUser({
			email: "no-permission@example.com",
			password: "strongPassword"
		});

		const response = await supertest(app)
			.get("/api/v1/boards/search/name")
			.set("Authorization", `Bearer ${authUser.body.user.authToken}`);

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(403);
		expect(response.body.code).toEqual("NOT_ENOUGH_PERMISSION");
	});

	it.only("should search board name", async () => {
		const response = await supertest(app).get("/api/v1/boards/search/name");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(200);
		console.log(response.body);
	});
});

// Create new boards
describe("POST /api/v1/boards", () => {
	it('should throw error "INVALID_AUTH_HEADER"', async () => {
		const response = await supertest(app).post("/api/v1/boards");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(400);
		expect(response.body.code).toEqual("INVALID_AUTH_HEADER");
	});

	it("should throw error not having 'board:create' permission", async () => {
		// seed users with no "board:create permission"
		const createUser = await database
			.insert([
				{
					userId: uuid(),
					email: "no-permission@example.com",
					password: hashPassword("strongPassword"),
					username: "no-permission"
				}
			])
			.into("users")
			.returning(["userId"]);

		// assign '@everyone' role to user
		await database.raw(
			`
			INSERT INTO roles_users (id, role_id, user_id)
			VALUES(:uuid, (
					SELECT
						id FROM roles
					WHERE
						name = '@everyone'
					), :userId)
		`,
			{
				uuid: uuid(),
				userId: createUser[0].userId
			}
		);

		const authUser = await getUser({
			email: "no-permission@example.com",
			password: "strongPassword"
		});

		const response = await supertest(app)
			.post("/api/v1/boards")
			.set("Authorization", `Bearer ${authUser.body.user.authToken}`);

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(403);
		expect(response.body.code).toEqual("NOT_ENOUGH_PERMISSION");
	});

	it("should create a board", () => {
		// seed users with no "board:create permission"
		const createUser = await database
			.insert([
				{
					userId: uuid(),
					email: "create-board@example.com",
					password: hashPassword("strongPassword"),
					username: "create-board"
				}
			])
			.into("users")
			.returning(["userId"]);
	});
});
