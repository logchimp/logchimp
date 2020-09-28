// modules
const generatePassword = require("omgopass");

// services
const getUser = require("../../services/auth/getUser");
const createUser = require("../../services/auth/createUser");

// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

describe("Create and get user account", () => {
	beforeAll(async () => {
		const dbMigrateLatest = await database.migrate.latest({
			directory: "./server/database/migrations",
			tableName: "migrations"
		});

		try {
			return dbMigrateLatest;
		} catch (err) {
			logger.log({
				level: "error",
				message: err
			});
		}
	});

	const password = generatePassword();

	describe("user1@email.com", () => {
		const username = "user1";
		const emailAddress = `${username}@email.com`;

		test(`Create '${emailAddress}' user`, async () => {
			const user = await createUser({
				emailAddress,
				password,
				firstname: "",
				lastname: "",
				isOwner: false
			});

			expect(user.firstname).toBe("");
			expect(user.lastname).toBe("");
			expect(user.emailAddress).toBe(emailAddress);
			expect(user.password).not.toBeNull();
			expect(user.username).toBe(username);
			expect(user.isOwner).toBeFalsy();
			expect(user.isModerator).toBeFalsy();
			expect(user.isBlocked).toBeFalsy();
		});

		test(`Get '${emailAddress}' user`, async () => {
			const user = await getUser(emailAddress);

			expect(user.firstname).toBe("");
			expect(user.lastname).toBe("");
			expect(user.emailAddress).toBe(emailAddress);
			expect(user.password).not.toBeNull();
			expect(user.username).toBe(username);
			expect(user.isOwner).toBeFalsy();
			expect(user.isModerator).toBeFalsy();
			expect(user.isBlocked).toBeFalsy();
		});
	});

	describe("user2@email.com", () => {
		const username = "user2";
		const emailAddress = `${username}@email.com`;
		const firstname = "Second";
		const lastname = "User";

		test(`Create '${emailAddress}' user`, async () => {
			const user = await createUser({
				emailAddress,
				password,
				firstname,
				lastname,
				isOwner: true,
				isModerator: true
			});

			expect(user.firstname).toBe(firstname);
			expect(user.lastname).toBe(lastname);
			expect(user.emailAddress).toBe(emailAddress);
			expect(user.password).not.toBeNull();
			expect(user.username).toBe(username);
			expect(user.isOwner).toBeTruthy();
			expect(user.isModerator).toBeTruthy();
			expect(user.isBlocked).toBeFalsy();
		});

		test(`Get '${emailAddress}' user`, async () => {
			const user = await getUser(emailAddress);

			expect(user.firstname).toBe(firstname);
			expect(user.lastname).toBe(lastname);
			expect(user.emailAddress).toBe(emailAddress);
			expect(user.password).not.toBeNull();
			expect(user.username).toBe(username);
			expect(user.isOwner).toBeTruthy();
			expect(user.isModerator).toBeTruthy();
			expect(user.isBlocked).toBeFalsy();
		});
	});

	afterAll(async () => {
		await database.destroy();
	});
});
