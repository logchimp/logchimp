const app = require('../../../app');
const supertest = require('supertest');

const database = require("../../utils/setupDatabase");

beforeAll(async () => {
	return await database.latest();
});

afterAll(async () => {
	return await database.rollback();
});

describe("GET /api/v1/settings/site", () => {
	it("should get all settings", async () => {
		const response = await supertest(app).get("/api/v1/settings/site");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(200);

		const settings = response.body.settings;
		expect(settings.title).toEqual("LogChimp");
		expect(settings.description).toEqual("Track user feedback to build better products");
		expect(settings.logo).toEqual("https://cdn.logchimp.codecarrot.net/logchimp_circular_logo.png");
		expect(settings.icon).toEqual("https://cdn.logchimp.codecarrot.net/logchimp_circular_logo.png");
		expect(settings.accentColor).toEqual("484d7c");
		expect(settings.googleAnalyticsId).toBeNull();
		expect(settings.isPoweredBy).toBeTruthy();
		expect(settings.allowSignup).toBeTruthy();
		expect(settings.developer_mode).toBeFalsy();

		// labs
		expect(settings.labs.comments).toBeFalsy();
	})
})
