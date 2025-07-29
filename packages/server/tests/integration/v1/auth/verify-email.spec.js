import { describe, it, expect} from "vitest";
import supertest from "supertest";
const app = require("../../../../app");

describe("POST /api/v1/auth/email/verify", () => {
    it('EMAIL_VERIFIED', async () => {
    const response = await supertest(app).post("/api/v1/auth/email/verify")
    .send({
      email: "admin@example.com"
    });
    expect(response.status).toBe(200);
  });

  it('should throw error "EMAIL_INVALID"', async () => {
    const response = await supertest(app).post("/api/v1/auth/email/verify")
    .send({
      email: "invalid-email"
    });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("EMAIL_INVALID");
  });
});
