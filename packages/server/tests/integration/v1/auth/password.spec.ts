import { describe, expect, it } from "vitest";
import supertest from "supertest";
import { faker } from "@faker-js/faker";

import app from "../../../../src/app";
import { createUser } from "../../../utils/seed/user";

describe("POST /api/v1//auth/password/reset", () => {
  //   it('should throw error "MAIL_CONFIG_MISSING" if mail service is not configured', async () => {
  //     // vi.stubEnv("LOGCHIMP_MAIL_HOST", "");
  //     // vi.stubEnv("LOGCHIMP_MAIL_PORT", "");
  //     // vi.stubEnv("LOGCHIMP_MAIL_USER", "");
  //     // vi.stubEnv("LOGCHIMP_MAIL_PASSWORD", "");

  //     vi.doMock("./../../../../src/utils/logchimpConfig", () => {
  //       // export the named `mail` as null
  //       return {
  //         mail: {
  //           host: undefined,
  //           user: undefined,
  //           password: undefined,
  //           port: undefined,
  //         },
  //       };
  //     });

  //     vi.stubEnv("LOGCHIMP_MAIL_HOST", "");
  //     vi.stubEnv("LOGCHIMP_MAIL_PORT", "");
  //     vi.stubEnv("LOGCHIMP_MAIL_USER", "");
  //     vi.stubEnv("LOGCHIMP_MAIL_PASSWORD", "");

  //     // vi.doMock("../../../../src/services/mail/mail", () => ({
  //     //   mail: null,
  //     // }));

  //     const response = await supertest(app)
  //       .post("/api/v1/auth/password/reset")
  //       .send({ email: "test@gmail.com" });

  //     expect(response.status).toBe(501);
  //     expect(response.body.code).toBe("MAIL_CONFIG_MISSING");
  //   });

  it('should throw error "EMAIL_INVALID" when invalid email is sent', async () => {
    const response = await supertest(app)
      .post("/api/v1/auth/password/reset")
      .send({ email: "not-an-email" });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("EMAIL_INVALID");
  });

  it('should throw error "USER_NOT_FOUND" when email does not exist', async () => {
    const response = await supertest(app)
      .post("/api/v1/auth/password/reset")
      .send({ email: faker.internet.email() });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("USER_NOT_FOUND");
  });

  it("should send password reset mail and return token in test env", async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .post("/api/v1/auth/password/reset")
      .send({ email: user.email });

    expect(response.status).toBe(200);
    expect(response.body.reset.success).toBe(true);
  });
});
