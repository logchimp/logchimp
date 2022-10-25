const supertest = require("supertest");

const app = require("../../../../server");
const database = require("../../../../server/database");
const cleanDatabase = require("../../../utils/cleanDatabase");

afterAll(() => cleanDatabase());

describe("POST /api/v1/auth/setup", () => {
  it('should throw error "EMAIL_INVALID"', async () => {
    const response = await supertest(app).post("/api/v1/auth/setup");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("EMAIL_INVALID");
  });

  it('show throw error "PASSWORD_MISSING"', async () => {
    const response = await supertest(app).post("/api/v1/auth/setup").send({
      email: "admin@example.com",
    });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("PASSWORD_MISSING");
  });
});
