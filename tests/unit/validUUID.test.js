const _ = require("lodash");

const { validUUID } = require("../../server/helpers");

describe("validate UUID", () => {
	it("should return empty string with empty string", () => {
		const res = validUUID("");

		expect(res).toEqual("");
		expect(typeof res).toEqual("string");
	});

	it("should return empty string with random string", () => {
		const res = validUUID("&(9798709879");

		expect(res).toEqual("");
		expect(typeof res).toEqual("string");
	});

	it("should return empty string with SQL injection", () => {
		const res = validUUID("DELETE * FROM posts;");

		expect(res).toEqual("");
		expect(typeof res).toEqual("string");
	});

	it("should return empty string with empty array", () => {
		const res = validUUID([]);

		expect(res).toEqual("");
		expect(typeof res).toEqual("string");
	});

	it("should return empty string with invalid UUID in array", () => {
		const res = validUUID(["sdfs", "tevedfsad", "*****"]);

		expect(res).toEqual("");
		expect(typeof res).toEqual("string");
	});

	it("should return empty string with SQL injection in array", () => {
		const res = validUUID(['UPDATE posts SET title = "LOL"', "DELETE posts"]);

		expect(res).toEqual("");
		expect(typeof res).toEqual("string");
	});

	it("should return empty string with invalid UUID in array", () => {
		const res = validUUID([
			"48EACC70-6D5E-403F-8CC2-AD945A3F3C",
			"E82739-FB69-4F06-9FEE-184CC834A492",
			"7D663644-5714-42-8A34-C34971A48A45",
			"BC8F29C0-5813-4162-94-7EB137CD2B13"
		]);

		expect(res).toEqual("");
		expect(typeof res).toEqual("string");
	});

	it("should return array of UUID with array of valid UUID", () => {
		const res = validUUID([
			"12E67136-3A19-4F71-9B41-DA8CE61BC80F",
			"D7573C0E-7909-448C-BA1D-6B29042F95C8"
		]);

		expect(res).toEqual([
			"12E67136-3A19-4F71-9B41-DA8CE61BC80F",
			"D7573C0E-7909-448C-BA1D-6B29042F95C8"
		]);
		expect(_.isArray(res)).toBeTruthy();
	});

	it("should return UUID with valid UUID", () => {
		const res = validUUID("1A3578E2-9594-4DDD-8D98-ACC55B1D6F99");

		expect(res).toEqual("1A3578E2-9594-4DDD-8D98-ACC55B1D6F99");
		expect(typeof res).toEqual("string");
	});
});
