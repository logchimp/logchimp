const createHex = require("./createHex");

test("Generate 6 character color hex code", () => {
	const color = createHex();
	const regex = new RegExp("^#([a-fA-F0-9]){3}$|[a-fA-F0-9]{6}$");
	const result = regex.test(color);

	expect(result).toBeTruthy();
});
