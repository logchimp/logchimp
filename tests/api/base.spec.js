const app = require("../../server");
const supertest = require("supertest");

test("ping /api", done => {
	supertest(app)
		.get("/api")
		.end((err, res) => {
			if (err) return done(err);
			expect(res.headers["content-type"]).toBe("text/html; charset=utf-8");
			expect(res.status).toBe(200);
			expect(res.text).toBe("👍");
			return done();
		});
});
