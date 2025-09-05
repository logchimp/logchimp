import { describe, it, expect } from "vitest";
import supertest from "supertest";

import { faker } from "@faker-js/faker";
import app from "../../../../src/app";
import database from "../../../../src/database";

describe("POST /api/v1/auth/signup", () => {
  it("should throw EMAIL_DOMAIN_BLACKLISTED", async () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS =
      "example.com, test.com, spam.com, badsite.org";
    const response = await supertest(app).post("/api/v1/auth/signup").send({
      email: "test@test.com",
      password: "password",
    });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("EMAIL_DOMAIN_BLACKLISTED");
  });

  it('should throw error "EMAIL_INVALID"', async () => {
    const response = await supertest(app).post("/api/v1/auth/signup");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("EMAIL_INVALID");
  });

  it('should throw error "PASSWORD_MISSING"', async () => {
    const response = await supertest(app).post("/api/v1/auth/signup").send({
      email: "signup_email@example.com",
    });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("PASSWORD_MISSING");
  });

  it("should create new user", async () => {
    const randomEmail = faker.internet.email();
    const username = randomEmail.split("@")[0];

    const response = await supertest(app).post("/api/v1/auth/signup").send({
      email: randomEmail,
      password: "password",
    });

    const user = response.body.user;
    expect(response.status).toBe(201);
    expect(user.username).toBe(username);
    expect(user.email).toBe(randomEmail.toLowerCase());
  });

  it("should not create new user and throws 'USER EXISTS'", async () => {
    const randomEmail = faker.internet.email();

    await supertest(app).post("/api/v1/auth/signup").send({
      email: randomEmail,
      password: "password",
    });

    const response = await supertest(app).post("/api/v1/auth/signup").send({
      email: randomEmail,
      password: "password",
    });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("USER_EXISTS");
  });

  it("should not create new user with different casing in email", async () => {
    const randomEmail = faker.internet.email();
    await supertest(app).post("/api/v1/auth/signup").send({
      email: randomEmail,
      password: "password",
    });

    const response = await supertest(app).post("/api/v1/auth/signup").send({
      email: randomEmail,
      password: "password",
    });
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(409);
    expect(response.body.code).toBe("USER_EXISTS");
  });

  it("should not be allow to create account", async () => {
    // set allowSignup to false in settings table
    await database
      .update({
        allowSignup: false,
      })
      .from("settings");

    const response = await supertest(app).post("/api/v1/auth/signup").send({
      email: "user@example.com",
      password: "password",
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("SIGNUP_NOT_ALLOWED");
  });
});
