import { describe, it, expect } from "vitest";
const supertest = require("supertest");

const app = require("../../../../app");
const database = require("../../../../database");
const { createToken } = require("../../../../services/token.service");
import { user as generateUser } from "../../../utils/generators";

describe("POST /api/v1/auth/email/validate", () => {
  it('should throw error "MISSING_TOKEN"', async () => {
    const response = await supertest(app).post("/api/v1/auth/email/validate");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.errors[0].code).toBe("MISSING_TOKEN");
  });

  it('should throw error "INVALID_TOKEN"', async () => {
    // generate token
    const tokenPayload = {
      userId: "601db0cd-ba5b-480d-a62b-06c8dcb72267",
      email: "mittalyashu77@gmail.com",
      type: "emailVerification",
    };

    const token = createToken(tokenPayload, {
      expiresIn: "2h",
    });

    const response = await supertest(app)
      .post("/api/v1/auth/email/validate")
      .send({
        token,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("INVALID_TOKEN");
  });

  it("should validate email token", async () => {
    const user = generateUser();
    user.isVerified = false;

    // generate and save token to database
    await database.insert(user).into("users");

    const tokenPayload = {
      userId: user.userId,
      email: user.email,
      type: "emailVerification",
    };

    const token = createToken(tokenPayload, {
      expiresIn: "2h",
    });

    await database
      .insert({
        email: tokenPayload.email,
        token,
      })
      .into("emailVerification");

    const response = await supertest(app)
      .post("/api/v1/auth/email/validate")
      .send({
        token,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    // expect(response.body.code).toBe("INVALID_TOKEN");
    expect(response.body.verify.success).toBeTruthy();

    // check if token still exists in database
    const getToken = await database
      .select()
      .from("emailVerification")
      .where({ email: user.email })
      .first();

    expect(getToken).toBeUndefined();
  });
});
