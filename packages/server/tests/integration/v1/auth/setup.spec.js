import { describe, it, expect } from "vitest";
const supertest = require("supertest");

import { cleanDb } from "../../../utils/db";
const app = require("../../../../app");

describe("GET /api/v1/auth/setup", () => {
  it('should not have site setup', async () => {
    await cleanDb();

    const response = await supertest(app).get("/api/v1/auth/setup");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);

    expect(response.body).toBeDefined()
    expect(response.body.is_setup).toBeFalsy()
  });

  it('show have site setup', async () => {
    await supertest(app).post("/api/v1/auth/setup").send({
      siteTitle: "LogChimp",
      name: "Admin",
      email: "admin@example.com",
      password: "password",
    });

    const response = await supertest(app).get("/api/v1/auth/setup");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);

    expect(response.body).toBeDefined()
    expect(response.body.is_setup).toBeTruthy()
  });
});

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

  it('should setup site', async () => {
    await cleanDb();

    const response = await supertest(app).post("/api/v1/auth/setup").send({
      siteTitle: "LogChimp",
      name: "Admin",
      email: "admin@example.com",
      password: "password",
    });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toEqual(201);

    expect(response.body.user).toBeDefined()
    expect(response.body.user.name).toEqual('Admin')
    expect(response.body.user.email).toEqual('admin@example.com')
    expect(response.body.user.authToken).toBeDefined()
  })
});
