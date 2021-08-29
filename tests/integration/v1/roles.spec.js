const supertest = require("supertest");
const { v4: uuid } = require("uuid");

const app = require("../../../server");
const database = require("../../../server/database");
const { getUser } = require("../../utils/getUser");
const { hashPassword } = require("../../../server/helpers");

beforeEach(() => {
	return database.migrate
		.latest()
		.then()
		.catch((err) => console.log(err));
});

afterEach(() => {
	return database.migrate
		.rollback()
		.then()
		.catch((err) => console.log(err));
});

// Get all roles
describe("GET /api/v1/roles", () => {
	it("should not have permission \'role:read\'", async () => {
		// create simple user (without any permissions) for getting roles
		const createUser = await database
			.insert([
				{
					userId: uuid(),
					email: "no-permission@example.com",
					password: hashPassword("strongPassword"),
					username: "no-permission",
				},
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
				userId: createUser[0].userId,
			}
		);

		const user = await getUser({
			email: "no-permission@example.com",
			password: "strongPassword",
		});

		const response = await supertest(app)
			.get("/api/v1/roles")
			.set("Authorization", `Bearer ${user.body.user.authToken}`);

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(403);
		expect(response.body.code).toEqual("NOT_ENOUGH_PERMISSION");
	});
});
