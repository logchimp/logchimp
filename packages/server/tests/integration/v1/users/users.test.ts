import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import type { IUserInfo } from "@logchimp/types";

import app from "../../../../src/app";
import database from "../../../../src/database";
import { createUser } from "../../../utils/seed/user";
import { createToken } from "../../../../src/services/token.service";
import { GET_USERS_FILTER_COUNT } from "../../../../src/constants";

let ownAuthToken: string | null = null;

// Helpers
async function ensureUsers(minUsers: number) {
  const existing = await database("users").count({ count: "*" }).first();
  const existingCount = Number.parseInt(existing?.count?.toString() || "0", 10);

  const toCreate = Math.max(0, minUsers - existingCount);
  for (let i = 0; i < toCreate; i++) {
    await createUser();
  }
}

describe("GET /api/v1/users", () => {
  // Ensure there are enough users to test both cursor and offset pagination
  beforeAll(async () => {
    await ensureUsers(50);
    const loginRes = await createUser({
      isOwner: true,
    });
    ownAuthToken = loginRes.user.authToken;
  });

  it("should throw INVALID_AUTH_HEADER", async () => {
    const response = await supertest(app).get("/api/v1/users");

    expect(response.statusCode).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should throw INVALID_AUTH_HEADER_FORMAT", async () => {
    const response = await supertest(app)
      .get("/api/v1/users")
      .set("Authorization", "WrongFormatTokenHere");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.statusCode).toBe(401);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER_FORMAT");
  });

  it("should throw INVALID_TOKEN", async () => {
    const response = await supertest(app)
      .get("/api/v1/users")
      .set("Authorization", "Bearer InvalidJWTToken");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.statusCode).toBe(401);
    expect(response.body.code).toBe("INVALID_TOKEN");
  });

  it("should throw 'SERVER_ERROR' for passing empty JWT token", async () => {
    const fakeToken = createToken({}, {});

    const response = await supertest(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.statusCode).toBe(500);
    expect(response.body.code).toBe("SERVER_ERROR");
  });

  it.skip("should get 0 users", async () => {
    const res = await supertest(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${ownAuthToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(200);

    expect(res.body.results).toHaveLength(0);
    expect(res.body.users).toHaveLength(0);

    const { start_cursor, end_cursor } = res.body.page_info;
    expect(start_cursor).toBeNull();
    expect(end_cursor).toBeNull();
  });

  it("should return JSON with users array (basic success)", async () => {
    const res = await supertest(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${ownAuthToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(200);
    // Backward compatible alias
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(Array.isArray(res.body.results)).toBe(true);
  });

  it("should clamp first to max when exceeding limit", async () => {
    const res = await supertest(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${ownAuthToken}`)
      .query({ first: 1000 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.length).toBeLessThanOrEqual(10);
  });

  it("should validate query params: invalid created => 400", async () => {
    const res = await supertest(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${ownAuthToken}`)
      .query({ first: 5, created: "FOO" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("should have 'results' equal to 'users' for backward compatibility", async () => {
    const res = await supertest(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${ownAuthToken}`)
      .query({ first: 5 });

    expect(res.status).toBe(200);
    expect(res.body.results).toEqual(res.body.users);
  });

  it("should default to ASC sort when 'created' not provided", async () => {
    const res = await supertest(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${ownAuthToken}`)
      .query({ first: 6 });

    const dates = res.body.users.map((u: any) => new Date(u.createdAt));
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i].getTime()).toBeLessThanOrEqual(dates[i + 1].getTime());
    }
  });

  it('should not have access to users without "isOwner" permission', async () => {
    const { user: authUser } = await createUser({
      isOwner: false,
    });

    const res = await supertest(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  describe("Cursor pagination", () => {
    describe("'?first=' param", () => {
      it("should default to cursor pagination return default list when no '?first=' param", async () => {
        const res = await supertest(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${ownAuthToken}`);

        const firstItem: IUserInfo = res.body.users[0];
        const lastItem: IUserInfo = res.body.users[res.body.users.length - 1];

        expect(res.headers["content-type"]).toContain("application/json");
        expect(res.status).toBe(200);

        expect(res.body.results).toHaveLength(GET_USERS_FILTER_COUNT);
        expect(res.body.users).toHaveLength(GET_USERS_FILTER_COUNT);
        expect(Array.isArray(res.body.results)).toBeTruthy();
        expect(Array.isArray(res.body.users)).toBeTruthy();

        expect(res.body.page_info).toBeDefined();
        expect(typeof res.body.page_info.count).toBe("number");
        expect(typeof res.body.page_info.current_page).toBe("number");
        expect(typeof res.body.page_info.has_next_page).toBe("boolean");

        // start_cursor and end_cursor are either string (uuid) or null when no data
        const { start_cursor, end_cursor } = res.body.page_info;

        expect(typeof start_cursor).toBe("string");
        expect(typeof end_cursor).toBe("string");

        expect(res.body.page_info.start_cursor).toBe(firstItem.userId);
        expect(res.body.page_info.end_cursor).toBe(lastItem.userId);

        // total_count and total_pages should be present in cursor mode
        expect(typeof res.body.total_count).toBe("number");

        // expect(res.body.total_count).toBe(15);
        // expect(
        //   res.body.total_pages === null ||
        //     typeof res.body.total_pages === "number",
        // ).toBeTruthy();
      });

      it("should paginate with '?after=' and increase current_page", async () => {
        const firstPage = await supertest(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${ownAuthToken}`)
          .query({ first: 5, created: "ASC" });

        expect(firstPage.status).toBe(200);
        expect(firstPage.body.page_info).toBeDefined();
        expect(firstPage.body.page_info.count).toBeLessThanOrEqual(5);

        const endCursor = firstPage.body.page_info.end_cursor;
        const page1Users = firstPage.body.users.map((u: IUserInfo) => u.userId);

        const secondPage = await supertest(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${ownAuthToken}`)
          .query({ first: 5, after: endCursor, created: "ASC" });

        expect(secondPage.status).toBe(200);
        expect(secondPage.body.page_info).toBeDefined();
        expect(secondPage.body.page_info.current_page).toBeGreaterThanOrEqual(
          2,
        );

        const page2Users = secondPage.body.users.map(
          (u: IUserInfo) => u.userId,
        );
        // No overlap between page 1 and page 2
        const overlap = page2Users.filter((id: string) =>
          page1Users.includes(id),
        );
        expect(overlap.length).toBe(0);
      });

      it("should get 0 users with '?after=0' param", async () => {
        const response = await supertest(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${ownAuthToken}`)
          .query({
            first: 0,
          });

        expect(response.headers["content-type"]).toContain("application/json");
        expect(response.status).toBe(200);

        const users: IUserInfo[] = response.body.users;
        expect(users).toHaveLength(0);
      });

      it("should compute has_next_page correctly for small page size", async () => {
        const res = await supertest(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${ownAuthToken}`)
          .query({ first: 2 });

        expect(res.status).toBe(200);
        expect(res.body.page_info).toBeDefined();
        expect(res.body.page_info.count).toBeLessThanOrEqual(2);

        // Given we ensured at least 25 users, with first=2 there must be a next page
        expect(res.body.page_info.has_next_page).toBe(true);

        expect(typeof res.body.total_count).toBe("number");
        expect(res.body.total_count).toBeGreaterThanOrEqual(25);
        expect(res.body.total_pages).toBeGreaterThanOrEqual(13);
      });
    });

    describe("'?created=' param", () => {
      it("should sort users by 'createdAt' order ASC and DESC", async () => {
        const asc = await supertest(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${ownAuthToken}`)
          .query({ first: 6, created: "ASC" });
        const desc = await supertest(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${ownAuthToken}`)
          .query({ first: 6, created: "DESC" });

        expect(asc.status).toBe(200);
        expect(desc.status).toBe(200);

        const ascDates = asc.body.users.map(
          (u: IUserInfo) => new Date(u.createdAt),
        );
        for (let i = 0; i < ascDates.length - 1; i++) {
          expect(ascDates[i].getTime()).toBeLessThanOrEqual(
            ascDates[i + 1].getTime(),
          );
        }

        const descDates = desc.body.users.map(
          (u: IUserInfo) => new Date(u.createdAt),
        );
        for (let i = 0; i < descDates.length - 1; i++) {
          expect(descDates[i].getTime()).toBeGreaterThanOrEqual(
            descDates[i + 1].getTime(),
          );
        }
      });
    });

    describe("'?after=' param", () => {
      it("should handle cursor pagination correctly", async () => {
        const res1 = await supertest(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${ownAuthToken}`)
          .query({ first: 3 });
        expect(res1.headers["content-type"]).toContain("application/json");
        const lastId = res1.body.results[2].userId;

        const res2 = await supertest(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${ownAuthToken}`)
          .query({
            first: 3,
            after: lastId,
          });

        expect(res2.headers["content-type"]).toContain("application/json");
        expect(res2.status).toBe(200);

        expect(res2.body.results).toHaveLength(3);
        expect(res2.body.page_info.end_cursor).toBeTypeOf("string");
        expect(res2.body.page_info.start_cursor).toBeTypeOf("string");

        const ids1 = res1.body.results.map((u: IUserInfo) => u.userId);
        const ids2 = res2.body.results.map((u: IUserInfo) => u.userId);
        expect(ids1.some((id: string) => ids2.includes(id))).toBe(false);
      });

      it("should throw 'VALIDATION_ERROR' error for invalid '?after=' param", async () => {
        const res = await supertest(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${ownAuthToken}`)
          .query({ first: 5, after: "not-a-uuid" });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
      });

      it("should handle empty '?after=' param gracefully", async () => {
        const res = await supertest(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${ownAuthToken}`)
          .query({
            after: "",
          });

        expect(res.headers["content-type"]).toContain("application/json");
        expect(res.status).toBe(400);

        expect(res.body.code).toBe("VALIDATION_ERROR");
        expect(res.body.message).toBe("Invalid query parameters");
        expect(res.body.errors?.[0]?.message).toMatch(/invalid uuid/gi);
      });
    });
  });

  describe("Offset pagination", () => {
    it("should support offset pagination via page param (backward compatibility)", async () => {
      const page1 = await supertest(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${ownAuthToken}`)
        .query({ first: 5, page: 1, created: "ASC" });
      const page2 = await supertest(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${ownAuthToken}`)
        .query({ first: 5, page: 2, created: "ASC" });

      expect(page1.status).toBe(200);
      expect(page2.status).toBe(200);

      // In offset mode, page_info, total_count and total_pages should be omitted
      expect(page1.body.page_info).toBeUndefined();
      expect(page1.body.total_count).toBeUndefined();
      expect(page1.body.total_pages).toBeUndefined();

      // Verify no overlap and combined size equals limit * 2 when enough users exist
      const ids1 = page1.body.users.map((u: IUserInfo) => u.userId);
      const ids2 = page2.body.users.map((u: IUserInfo) => u.userId);

      const overlap = ids1.filter((id: string) => ids2.includes(id));
      expect(overlap.length).toBe(0);

      expect(ids1.length + ids2.length).toBeLessThanOrEqual(10);
    });

    describe("'?page=' param", () => {
      it("should coerce page=0 and page=-1 to page=1 in offset mode", async () => {
        const page0 = await supertest(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${ownAuthToken}`)
          .query({ first: 5, page: 0, created: "ASC" });

        const pageNeg1 = await supertest(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${ownAuthToken}`)
          .query({ first: 5, page: -1, created: "ASC" });

        const page1 = await supertest(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${ownAuthToken}`)
          .query({ first: 5, page: 1, created: "ASC" });

        const ids0 = page0.body.users.map((u: IUserInfo) => u.userId);
        const idsNeg1 = pageNeg1.body.users.map((u: IUserInfo) => u.userId);
        const ids1 = page1.body.users.map((u: IUserInfo) => u.userId);

        expect(ids0).toEqual(ids1);
        expect(idsNeg1).toEqual(ids1);
      });

      it("should get an empty users Array for large '?page=1000'", async () => {
        const response = await supertest(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${ownAuthToken}`)
          .query({
            page: 1000,
            created: "DESC",
          });

        const users: IUserInfo[] = response.body.users;
        expect(response.headers["content-type"]).toContain("application/json");
        expect(response.status).toBe(200);
        expect(users).toHaveLength(0);
      });
    });

    describe("'?limit=' param", () => {
      it("should get 2 filtered users in 'DESC' order", async () => {
        const response = await supertest(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${ownAuthToken}`)
          .query({
            limit: 2,
            created: "DESC",
          });

        const users: IUserInfo[] = response.body.users;
        expect(response.headers["content-type"]).toContain("application/json");
        expect(response.status).toBe(200);
        expect(users).toHaveLength(2);

        const userCreationDates = users.map(
          (u: IUserInfo) => new Date(u.createdAt),
        );

        for (let i = 0; i < userCreationDates.length - 1; i++) {
          const curr = userCreationDates[i].getTime();
          const next = userCreationDates[i + 1].getTime();
          expect(curr).to.be.at.least(next);
        }
      });

      it("should get 15 users, fallback to cap value of 10 users", async () => {
        const response = await supertest(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${ownAuthToken}`)
          .query({
            limit: 15,
          });

        const users: IUserInfo[] = response.body.users;

        expect(response.headers["content-type"]).toContain("application/json");
        expect(response.status).toBe(200);
        expect(users).toHaveLength(10);

        const usersCreationDates = users.map(
          (u: IUserInfo) => new Date(u.createdAt),
        );

        for (let i = 0; i < usersCreationDates.length - 1; i++) {
          const curr = usersCreationDates[i].getTime();
          const next = usersCreationDates[i + 1].getTime();
          expect(curr).to.be.at.most(next);
        }
      });
    });
  });
});
