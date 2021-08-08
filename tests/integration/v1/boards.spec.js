const supertest = require("supertest");

const app = require("../../../server");
const database = require("../../../server/database");
const { board: generateBoards } = require('../../utils/generators')

beforeAll(async () => {
	return await database.migrate.latest();
});

afterAll(async () => {
	return await database.migrate.rollback();
});

// Get all boards
describe("GET /api/v1/boards", () => {
	it("should get 0 boards", async () => {
		const response = await supertest(app).get("/api/v1/boards");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(200);
		expect(response.body.boards).toHaveLength(0)
	})

	// it("should get all boards", async () => {
	// 	// generate & add board
	// 	const board = generateBoards();
	// 	console.log(board);

	// 	await database.insert(board).into("boards");

	// 	const response = await supertest(app).get("/api/v1/boards");

	// 	expect(response.headers["content-type"]).toContain("application/json");
	// 	expect(response.status).toBe(200);

	// 	console.log(response.body);
	// 	const boards = response.body.boards;

	// 	delete boards[0].boardId;
	// 	expect(boards[0]).toStrictEqual(boards);
	// })
});

// Get boards by URL
describe("GET /boards/:url", () => {
	it("should throw error \"BOARD_NOT_FOUND\"", async () => {
		const response = await supertest(app).get("/api/v1/boards/do_not_exists");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(404);
		expect(response.body.code).toEqual("BOARD_NOT_FOUND");
	})

	it("should get board by url", async () => {
		// generate & add board
		const board = generateBoards();
		board.url = 'create-existing-board'

		await database.insert(board).into("boards");

		const response = await supertest(app).get("/api/v1/boards/create-existing-board");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(200);
		expect(response.body.board).toStrictEqual(board);
	})
});

// Create new boards
describe("POST /api/v1/boards", () => {
	it("should throw error \"INVALID_AUTH_HEADER\"", async () => {
		const response = await supertest(app).post("/api/v1/boards");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(400);
		expect(response.body.code).toEqual("INVALID_AUTH_HEADER");
	})
});
