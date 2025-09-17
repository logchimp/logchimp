import { describe, it, expect } from "vitest";
import supertest from "supertest";
import { v4 as uuid } from "uuid";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type {
  IPasswordResetJwtPayload,
  IVerifyEmailJwtPayload,
} from "@logchimp/types";
import { faker } from "@faker-js/faker";

import app from "../../../../src/app";
import database from "../../../../src/database";
import { configManager } from "../../../../src/utils/logchimpConfig";
import { createToken } from "../../../../src/services/token.service";
import { createUser } from "../../../utils/seed/user";

const config = configManager.getConfig();

describe("POST /api/v1/auth/email/verify", () => {
  it("should throw error 'INVALID_AUTH_HEADER'", async () => {
    const res = await supertest(app).post("/api/v1/auth/email/verify");

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw error 'EMAIL_VERIFIED' for already verified user", async () => {
    const { user } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .post("/api/v1/auth/email/verify")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(409);
    expect(response.body.code).toBe("EMAIL_VERIFIED");
  });

  it("should throw error 'EMAIL_INVALID'", async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .post("/api/v1/auth/email/verify")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        email: "invalid-email",
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("EMAIL_INVALID");
  });

  it("should verify the email", async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .post("/api/v1/auth/email/verify")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        email: user.email,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);

    const verify = response.body.verify;
    expect(verify.success).toBeTruthy();

    // in non prod environments
    expect(verify.__token.email).toBe(user.email);
    expect(typeof verify.__token.token).toBe("string");

    const token = verify.__token.token;
    const decoded = jwt.verify(token, config.secretKey) as JwtPayload &
      (IVerifyEmailJwtPayload | IPasswordResetJwtPayload);

    expect(decoded.userId).toBe(user.userId);
    expect(decoded.email).toBe(user.email);
    expect(decoded.type).toBe("emailVerification");
  });
});

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
      userId: uuid(),
      email: faker.internet.email(),
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
    const { user } = await createUser();
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
