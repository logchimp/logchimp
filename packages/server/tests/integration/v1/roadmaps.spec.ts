import { beforeAll, expect, it } from "vitest";
import supertest from "supertest";
import { faker } from "@faker-js/faker";
import { v4 as uuid } from "uuid";
import type {
  IAuthLoginResponseBody,
  IGetRoadmapByUrlResponseBody,
  IRoadmapPrivate,
  IUpdateRoadmapRequestBody,
} from "@logchimp/types";

import app from "../../../src/app";
import { roadmap as generateRoadmap } from "../../utils/generators";
import database from "../../../src/database";

import { createUser } from "../../utils/seed/user";
import { createRoleWithPermissions } from "../../utils/createRoleWithPermissions";
import { describeEE, itEE } from "../../utils/skipEE";

// Get all roadmaps
describeEE("GET /api/v1/roadmaps", () => {
  beforeAll(async () => {
    await database.transaction(async (trx) => {
      // Seed 100 roadmaps with ascending indices: 50 public, 50 private
      for (let i = 0; i < 100; i++) {
        const isPublic = i < 50; // first 50 public
        const r = await generateRoadmap({ display: isPublic, index: i + 1 });
        await trx.insert(r).into("roadmaps");
      }
    });
  });

  it.skip("should get 0 roadmaps", async () => {
    const response = await supertest(app).get("/api/v1/roadmaps");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(0);
    expect(response.body.roadmaps).toHaveLength(0);
  });

  itEE.skip("should return correct data for last page", async () => {
    const res = await supertest(app)
      .get("/api/v1/roadmaps")
      .query({ first: 20 });

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(200);

    expect(res.body.results).toHaveLength(10);
    expect(res.body.page_info.has_next_page).toBe(false);
    expect(res.body.page_info.end_cursor).toBeTypeOf("string");
    expect(res.body.page_info.start_cursor).toBeTypeOf("string");
    expect(res.body.total_count).toBe(10);
  });

  describeEE("'?first=' param", () => {
    itEE("should return default list when no '?first=' param", async () => {
      const res = await supertest(app).get("/api/v1/roadmaps");

      const firstItem: IRoadmapPrivate = res.body.results[0];
      const lastItem: IRoadmapPrivate =
        res.body.results[res.body.results.length - 1];

      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.status).toBe(200);

      expect(res.body.results).toHaveLength(20);
      expect(res.body.roadmaps).toHaveLength(20);
      expect(Array.isArray(res.body.results)).toBeTruthy();
      expect(Array.isArray(res.body.roadmaps)).toBeTruthy();

      expect(res.body.page_info).toBeDefined();
      expect(typeof res.body.page_info.count).toBe("number");
      expect(typeof res.body.page_info.current_page).toBe("number");
      expect(typeof res.body.page_info.has_next_page).toBe("boolean");

      expect(res.body.page_info.start_cursor).toBe(firstItem.id);
      expect(res.body.page_info.end_cursor).toBe(lastItem.id);
      expect(res.body.page_info.start_cursor).toBeTypeOf("string");
      expect(res.body.page_info.end_cursor).toBeTypeOf("string");
      expect(res.body.page_info.has_next_page).toBe(true);

      // expect(res.body.total_count).toBe(15);
    });

    itEE("should return 5 items per page with '?first=5'", async () => {
      const res = await supertest(app)
        .get("/api/v1/roadmaps")
        .query({ first: 5 });

      const firstItem: IRoadmapPrivate = res.body.results[0];
      const lastItem: IRoadmapPrivate =
        res.body.results[res.body.results.length - 1];

      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.status).toBe(200);

      expect(res.body.results).toHaveLength(5);
      expect(res.body.roadmaps).toHaveLength(5);
      expect(Array.isArray(res.body.results)).toBeTruthy();
      expect(Array.isArray(res.body.roadmaps)).toBeTruthy();

      expect(res.body.page_info.start_cursor).toBe(firstItem.id);
      expect(res.body.page_info.end_cursor).toBe(lastItem.id);
      expect(res.body.page_info.start_cursor).toBeTypeOf("string");
      expect(res.body.page_info.end_cursor).toBeTypeOf("string");
      expect(res.body.page_info.has_next_page).toBe(true);
      expect(res.body.page_info.end_cursor).not.toBe(
        res.body.page_info.start_cursor,
      );
      expect(res.body.page_info.count).toBe(5);

      // expect(res.body.total_pages).toBe(2); // 10 public / 5 per page
      // expect(res.body.total_count).toBe(10);
    });

    itEE("should cap the '?first=' param value with 20 max items", async () => {
      const res = await supertest(app)
        .get("/api/v1/roadmaps")
        .query({ first: 25 });

      const firstItem: IRoadmapPrivate = res.body.results[0];
      const lastItem: IRoadmapPrivate =
        res.body.results[res.body.results.length - 1];

      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.status).toBe(200);

      expect(res.body.results).toHaveLength(20);
      expect(res.body.roadmaps).toHaveLength(20);
      expect(Array.isArray(res.body.results)).toBeTruthy();
      expect(Array.isArray(res.body.roadmaps)).toBeTruthy();

      expect(res.body.page_info.start_cursor).toBe(firstItem.id);
      expect(res.body.page_info.end_cursor).toBe(lastItem.id);
      expect(res.body.page_info.start_cursor).toBeTypeOf("string");
      expect(res.body.page_info.end_cursor).toBeTypeOf("string");
      expect(res.body.page_info.has_next_page).toBe(true);
      expect(res.body.page_info.end_cursor).not.toBe(
        res.body.page_info.start_cursor,
      );
    });

    itEE("should throw 'VALIDATION_ERROR' error on '?first=0'", async () => {
      const response = await supertest(app)
        .get("/api/v1/roadmaps")
        .query({ first: 0 });

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(400);

      expect(response.body.code).toBe("VALIDATION_ERROR");
      expect(response.body.message).toBe("Invalid query parameters");
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: "Too small: expected number to be >=1",
          }),
        ]),
      );
    });
  });

  describeEE("'?after=' param", () => {
    itEE("should handle cursor pagination correctly", async () => {
      const res1 = await supertest(app)
        .get("/api/v1/roadmaps")
        .query({ first: 3 });
      expect(res1.headers["content-type"]).toContain("application/json");
      const lastId = res1.body.results[2].id;

      const res2 = await supertest(app).get("/api/v1/roadmaps").query({
        first: 3,
        after: lastId,
      });
      expect(res2.headers["content-type"]).toContain("application/json");
      expect(res2.status).toBe(200);
      expect(res2.body.results).toHaveLength(3);
      expect(res2.body.page_info.end_cursor).toBeTypeOf("string");
      expect(res2.body.page_info.start_cursor).toBeTypeOf("string");

      const ids1 = res1.body.results.map((r: IRoadmapPrivate) => r.id);
      const ids2 = res2.body.results.map((r: IRoadmapPrivate) => r.id);
      expect(ids1.some((id: string) => ids2.includes(id))).toBe(false);
    });

    itEE(
      "should throw 'VALIDATION_ERROR' error for invalid '?after=' param",
      async () => {
        const res = await supertest(app).get("/api/v1/roadmaps").query({
          after: "invalid-uuid",
        });

        expect(res.headers["content-type"]).toContain("application/json");
        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
        expect(res.body.errors).toBeDefined();
      },
    );

    itEE("should handle empty '?after=' param gracefully", async () => {
      const res = await supertest(app).get("/api/v1/roadmaps").query({
        after: "",
      });

      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.status).toBe(400);

      expect(res.body.code).toBe("VALIDATION_ERROR");
      expect(res.body.message).toBe("Invalid query parameters");
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: "Invalid cursor value",
          }),
        ]),
      );
    });
  });

  describeEE("'?visibility=' param", () => {
    itEE(
      "should set default '?visibility=public' without permission",
      async () => {
        const resPrivate = await supertest(app).get("/api/v1/roadmaps").query({
          visibility: "private",
          first: 10,
        });

        expect(resPrivate.headers["content-type"]).toContain(
          "application/json",
        );
        expect(resPrivate.status).toBe(200);

        expect(Array.isArray(resPrivate.body.results)).toBeTruthy();
        expect(resPrivate.body.total_count).toBeGreaterThanOrEqual(
          resPrivate.body.results.length,
        );

        expect(
          resPrivate.body.results.every(
            (r: IRoadmapPrivate) => r.display === true,
          ),
        ).toBeTruthy();

        // expect(resPrivate.body.total_count).toBe(10);
        // expect(resPrivate.body.page_info.has_next_page).toBe(false);

        const resBoth = await supertest(app).get("/api/v1/roadmaps").query({
          visibility: "public",
          first: 10,
        });
        expect(resBoth.headers["content-type"]).toContain("application/json");
        expect(resBoth.status).toBe(200);

        expect(
          resBoth.body.results.every(
            (r: IRoadmapPrivate) => r.display === true,
          ),
        ).toBeTruthy();

        // expect(resBoth.body.total_count).toBe(10);
      },
    );

    itEE(
      "should get roadmaps '?visibility=public' without permission",
      async () => {
        const res = await supertest(app)
          .get("/api/v1/roadmaps")
          .query({ visibility: "public" });
        expect(res.headers["content-type"]).toContain("application/json");
        expect(res.status).toBe(200);
        // expect(res.body.total_count).toBe(10);
        expect(
          res.body.results.every((r: IRoadmapPrivate) => r.display === true),
        ).toBeTruthy();
      },
    );

    itEE(
      "should apply '?visibility=private' filter with permission",
      async () => {
        const { user } = await createUser({ isVerified: true });
        await createRoleWithPermissions(user.userId, ["roadmap:read"], {
          roleName: "Roadmap Reader",
        });

        const resPrivate = await supertest(app)
          .get("/api/v1/roadmaps")
          .set("Authorization", `Bearer ${user.authToken}`)
          .query({ visibility: "private" });

        expect(resPrivate.headers["content-type"]).toContain(
          "application/json",
        );
        expect(resPrivate.status).toBe(200);
        // expect(resPrivate.body.total_count).toBe(5);
        expect(
          resPrivate.body.results.every(
            (r: IRoadmapPrivate) => r.display === false,
          ),
        ).toBeTruthy();

        const resPublic = await supertest(app)
          .get("/api/v1/roadmaps")
          .set("Authorization", `Bearer ${user.authToken}`)
          .query({ visibility: "public" });

        expect(resPublic.headers["content-type"]).toContain("application/json");
        expect(resPublic.status).toBe(200);
        // expect(resPublic.body.total_count).toBe(10);
        expect(
          resPublic.body.results.every(
            (r: IRoadmapPrivate) => r.display === true,
          ),
        ).toBeTruthy();

        const resBoth = await supertest(app)
          .get("/api/v1/roadmaps")
          .set("Authorization", `Bearer ${user.authToken}`)
          .query({ visibility: "public,private" });

        expect(resBoth.headers["content-type"]).toContain("application/json");
        expect(resBoth.status).toBe(200);
        // expect(resBoth.body.total_count).toBe(15);
      },
    );

    itEE(
      "should calculate 'has_next_page' correctly with '?visibility=' filters",
      async () => {
        // Page 1
        const page1 = await supertest(app).get("/api/v1/roadmaps").query({
          first: 6,
        });

        expect(page1.headers["content-type"]).toContain("application/json");
        expect(page1.status).toBe(200);
        expect(page1.body.page_info.count).toBe(6);
        expect(page1.body.page_info.has_next_page).toBe(true);

        // Page 2
        const after = page1.body.page_info.end_cursor;
        const page2 = await supertest(app).get("/api/v1/roadmaps").query({
          first: 6,
          after,
        });

        expect(page2.headers["content-type"]).toContain("application/json");
        expect(page2.status).toBe(200);
        // remaining 4 public
        // expect(page2.body.page_info.count).toBe(4);
        // expect(page2.body.page_info.has_next_page).toBe(false);
      },
    );
  });
});

// Get roadmaps by URL
describeEE("GET /api/v1/roadmaps/:url", () => {
  const testCasesArr = [
    "ROADMAP_NOT_FOUND",
    "undefined",
    "null",
    null,
    undefined,
    "roadmap name with spaces",
    "roadmap+with+plus",
    "roadmap#with#hash",
    "456575634",
    "a@@@@@@@@",
    "a".repeat(5000), // 5000 characters
    "बोर्ड",
    "...",
    "😀️😇️",
  ];

  itEE.each(testCasesArr)(
    `should throw error "ROADMAP_NOT_FOUND" for '%s'`,
    async (name) => {
      const res = await supertest(app).get(`/api/v1/roadmaps/${name}`);

      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.status).toBe(404);
      expect(res.body.code).toBe("ROADMAP_NOT_FOUND");
    },
  );

  ["*&^(*&$%&*^&%&^%*"].map((name) =>
    itEE(
      `should throw error "DECODE_URI_ERROR" for '${name}' roadmap`,
      async () => {
        const { user } = await createUser({
          isVerified: true,
        });
        await createRoleWithPermissions(user.userId, ["roadmap:read"], {
          roleName: "Roadmap Reader",
        });

        const response = await supertest(app)
          .get(`/api/v1/roadmaps/search/${name}`)
          .set("Authorization", `Bearer ${user.authToken}`);

        expect(response.headers["content-type"]).toContain("application/json");

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("DECODE_URI_ERROR");
      },
    ),
  );

  itEE("should get roadmap by url", async () => {
    const roadmapUrl = faker.commerce
      .productName()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .substring(0, 50)
      .replace(/^-+|-+$/g, "");
    const roadmap = await generateRoadmap(
      {
        url: roadmapUrl,
        display: true,
      },
      true,
    );

    const res = await supertest(app).get(`/api/v1/roadmaps/${roadmapUrl}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(200);

    const body = res.body as IGetRoadmapByUrlResponseBody;

    expect(body.roadmap).not.toBeNull();
    expect(body.roadmap).not.toBeUndefined();

    expect(body.roadmap.id).toBe(roadmap.id);
    expect(body.roadmap.name).toBe(roadmap.name);
    expect(body.roadmap.url).toBe(roadmap.url);
    expect(body.roadmap.index).toBe(roadmap.index);
    expect(body.roadmap.display).toBe(roadmap.display);
    expect(body.roadmap.color).toBe(roadmap.color);
    expect(body.roadmap.created_at).toBe(roadmap.created_at);
  });
});

// Search roadmaps by name
describeEE("GET /api/v1/roadmaps/search/:name", () => {
  itEE('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).get(
      "/api/v1/roadmaps/search/completed",
    );

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  itEE("should throw error not having 'roadmap:read' permission", async () => {
    const { user: authUser } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .get("/api/v1/roadmaps/search/completed")
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  const zeroSearchResultsArr = [
    "ROADMAP_NOT_FOUND",
    "undefined",
    "null",
    null,
    undefined,
    "456575634",
  ];

  itEE.each(zeroSearchResultsArr)(
    `should get 0 search results for "%s" roadmaps`,
    async (name) => {
      const { user } = await createUser({
        isVerified: true,
      });
      await createRoleWithPermissions(user.userId, ["roadmap:read"], {
        roleName: "Roadmap Reader",
      });

      const response = await supertest(app)
        .get(`/api/v1/roadmaps/search/${name}`)
        .set("Authorization", `Bearer ${user.authToken}`);

      expect(response.body.roadmaps).toStrictEqual([]);
      expect(response.body.roadmaps).toHaveLength(0);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(200);
    },
  );

  ["*&^(*&$%&*^&%&^%*"].map((name) =>
    itEE(`should get 0 search results for "${name}" roadmaps`, async () => {
      const { user } = await createUser({
        isVerified: true,
      });
      await createRoleWithPermissions(user.userId, ["roadmap:read"], {
        roleName: "Roadmap Reader",
      });

      const response = await supertest(app)
        .get(`/api/v1/roadmaps/search/${name}`)
        .set("Authorization", `Bearer ${user.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(400);
      expect(response.body.code).toBe("DECODE_URI_ERROR");
    }),
  );

  const roadmapName = faker.commerce
    .productName()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .substring(0, 50)
    .replace(/^-+|-+$/g, "");
  itEE(`should show 2 "${roadmapName}" matching roadmaps`, async () => {
    const r1 = await generateRoadmap(
      {
        name: `${roadmapName}_first`,
      },
      true,
    );
    const r2 = await generateRoadmap(
      {
        name: `${roadmapName}_two`,
      },
      true,
    );

    const { user } = await createUser({
      isVerified: true,
    });
    await createRoleWithPermissions(user.userId, ["roadmap:read"], {
      roleName: "Roadmap Reader",
    });

    const response = await supertest(app)
      .get(`/api/v1/roadmaps/search/${roadmapName}`)
      .set("Authorization", `Bearer ${user.authToken}`);

    const roadmaps = response.body.roadmaps;
    expect(roadmaps).toHaveLength(2);

    expect(roadmaps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: r1.id,
          name: r1.name,
          url: r1.url,
          color: r1.color,
          display: r1.display,
          index: r1.index,
        }),
        expect.objectContaining({
          id: r2.id,
          name: r2.name,
          url: r2.url,
          color: r2.color,
          display: r2.display,
          index: r2.index,
        }),
      ]),
    );

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);
  });

  const searchSpecialCases = [
    { name: "emoji roadmap 🚀", searchTerm: "emoji" },
    { name: "emoji roadmap 🚀", searchTerm: "🚀" },
    { name: "unicode बोर्ड", searchTerm: "बोर्ड" },
    { name: "roadmap with spaces", searchTerm: "with spaces" },
    { name: "roadmap+with+plus", searchTerm: "+" },
    { name: "roadmap#with#hash", searchTerm: "#" },
    { name: "a@@@@@@@@", searchTerm: "a@@" },
    { name: "Hello World!!!", searchTerm: "!!!" },
    { name: "completion 100% ready", searchTerm: "100%" },
    { name: "roadmap_with_underscore", searchTerm: "_" },
    { name: "roadmap\\with\\backslash", searchTerm: "\\" },
  ];

  itEE.each(searchSpecialCases)(
    "should find roadmap named '$name' when searching for '$searchTerm'",
    async ({ name, searchTerm }) => {
      const roadmap = await generateRoadmap({ name, display: true }, true);
      const nonMatchingRoadmap = await generateRoadmap(
        { name: "unrelated", display: true },
        true,
      );

      const { user: authUser } = await createUser();
      await createRoleWithPermissions(authUser.userId, ["roadmap:read"], {
        roleName: "Roadmap Reader",
      });

      const response = await supertest(app)
        .get(`/api/v1/roadmaps/search/${encodeURIComponent(searchTerm)}`)
        .set("Authorization", `Bearer ${authUser.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(200);

      const roadmaps = response.body.roadmaps;
      expect(roadmaps.length).toBeGreaterThanOrEqual(1);
      expect(roadmaps.map((r: IRoadmapPrivate) => r.id)).not.toContain(
        nonMatchingRoadmap.id,
      );

      expect(roadmaps).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: roadmap.id,
            name: roadmap.name,
            url: roadmap.url,
          }),
        ]),
      );
    },
  );

  itEE("should search roadmap by URL", async () => {
    const urlSuffix = faker.string.alphanumeric(8).toLowerCase();
    const url = faker.string.alphanumeric(5).toLowerCase() + urlSuffix;
    const roadmap = await generateRoadmap(
      {
        url,
      },
      true,
    );

    const { user: authUser } = await createUser();
    await createRoleWithPermissions(authUser.userId, ["roadmap:read"], {
      roleName: "Roadmap Reader",
    });

    const response = await supertest(app)
      .get(`/api/v1/roadmaps/search/${encodeURIComponent(urlSuffix)}`)
      .set("Authorization", `Bearer ${authUser.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);

    const roadmaps = response.body.roadmaps;
    expect(roadmaps.length).toBe(1);

    const roadmap1 = roadmaps[0];
    expect(roadmap1.name).toBe(roadmap.name);
    expect(roadmap1.url).toBe(url);
  });
});

// Create new roadmaps
describeEE("POST /api/v1/roadmaps", () => {
  itEE('should throw error "INVALID_AUTH_HEADER"', async () => {
    const res = await supertest(app).post("/api/v1/roadmaps");

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_AUTH_HEADER");
  });

  itEE(
    "should throw error not having 'roadmap:create' permission",
    async () => {
      const { user: authUser } = await createUser({
        isVerified: true,
      });

      const response = await supertest(app)
        .post("/api/v1/roadmaps")
        .set("Authorization", `Bearer ${authUser.authToken}`);

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(403);
      expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
    },
  );

  itEE("should create private roadmap with default values", async () => {
    const { user } = await createUser({
      isVerified: true,
    });
    await createRoleWithPermissions(user.userId, ["roadmap:create"], {
      roleName: "Roadmap Creator",
    });

    const response = await supertest(app)
      .post("/api/v1/roadmaps")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(201);

    const roadmap = response.body.roadmap;

    expect(roadmap.name).toBe("new roadmap");
    expect(roadmap.url).toContain("new-roadmap-");
    expect(roadmap.display).toBeFalsy();

    expect(roadmap.id).toBeDefined();
    expect(roadmap.color).toBeDefined();
    expect(roadmap.index).toBeDefined();
    expect(roadmap.created_at).toBeDefined();
  });

  describeEE("", () => {
    let createUserResponse: IAuthLoginResponseBody | undefined;
    beforeAll(async () => {
      createUserResponse = await createUser({
        isVerified: true,
      });
      await createRoleWithPermissions(
        createUserResponse.user.userId,
        ["roadmap:create"],
        {
          roleName: "Roadmap Creator",
        },
      );
    });

    // --- line break ---

    const testCasesArr = [
      { input: "feature requests", expected: "feature requests" },
      { input: "", expected: "new roadmap" },
      { input: "undefined", expected: "undefined" },
      { input: "null", expected: "null" },
      { input: null, expected: "new roadmap" },
      { input: undefined, expected: "new roadmap" },
      { input: "456575634", expected: "456575634" },
      {
        input: "roadmap name with spaces",
        expected: "roadmap name with spaces",
      },
      { input: "roadmap+with+plus", expected: "roadmap+with+plus" },
      { input: "roadmap#with#hash", expected: "roadmap#with#hash" },
      { input: "a@@@@@@@@", expected: "a@@@@@@@@" },
      { input: "बोर्ड", expected: "बोर्ड" },
      { input: ".", expected: "." },
      { input: "...", expected: "..." },
      { input: "../...", expected: "../..." },
      { input: "😀️😈️", expected: "😀️😈️" },
    ];

    itEE.each(testCasesArr)(
      `should create with name: '$input'`,
      async ({ input, expected }) => {
        const res = await supertest(app)
          .post("/api/v1/roadmaps")
          .set("Authorization", `Bearer ${createUserResponse.user.authToken}`)
          .send({ name: input });

        expect(res.headers["content-type"]).toContain("application/json");
        expect(res.status).toBe(201);

        const roadmap = res.body.roadmap;
        expect(roadmap.name).toBe(expected);
      },
    );

    itEE("should throw server error on long roadmap name", async () => {
      const res = await supertest(app)
        .post("/api/v1/roadmaps")
        .set("Authorization", `Bearer ${createUserResponse.user.authToken}`)
        .send({
          name: "a".repeat(5000), // 5000 characters
          display: true,
        });

      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.status).toBe(500);
      expect(res.body.code).toBe("SERVER_ERROR");
    });
  });
});

// Update roadmaps
describeEE("PATCH /api/v1/roadmaps", () => {
  itEE('should throw error "INVALID_AUTH_HEADER"', async () => {
    const res = await supertest(app).patch("/api/v1/roadmaps");

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_AUTH_HEADER");
  });

  itEE(
    "should throw error not having 'roadmap:update' permission",
    async () => {
      const { user: authUser } = await createUser({
        isVerified: true,
      });
      const r1 = await generateRoadmap({}, true);

      const response = await supertest(app)
        .patch("/api/v1/roadmaps")
        .set("Authorization", `Bearer ${authUser.authToken}`)
        .send({
          id: r1.id,
        });

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(403);
      expect(response.body.code).toEqual("NOT_ENOUGH_PERMISSION");
    },
  );

  itEE("should throw error 'ROADMAP_ID_OR_URL_MISSING'", async () => {
    const { user: authUser } = await createUser({
      isVerified: true,
    });
    await createRoleWithPermissions(authUser.userId, ["roadmap:update"], {
      roleName: "Roadmap update",
    });

    const response = await supertest(app)
      .patch("/api/v1/roadmaps")
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send();

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toEqual("ROADMAP_ID_OR_URL_MISSING");
  });

  describeEE("Validation Errors", () => {
    const testCases = [
      {
        // testName:
        testName: "ROADMAP_NAME_MISSING on empty name",
        omitField: null,
        overrideFields: {
          name: "",
        },
        expectedError: {
          message: "Roadmap name missing",
          code: "ROADMAP_NAME_MISSING",
        },
        expectedStatus: 400,
      },
      {
        testName: "ROADMAP_NAME_MISSING",
        omitField: "name",
        expectedError: {
          message: "Roadmap name missing",
          code: "ROADMAP_NAME_MISSING",
        },
        expectedStatus: 400,
      },
      {
        testName: "ROADMAP_URL_MISSING on empty url",
        omitField: null,
        overrideFields: {
          url: "",
        },
        expectedError: {
          message: "Roadmap url cannot be empty",
          code: "ROADMAP_URL_MISSING",
        },
        expectedStatus: 400,
      },
      {
        testName: "ROADMAP_URL_MISSING",
        omitField: "url",
        expectedError: {
          message: "Roadmap url cannot be empty",
          code: "ROADMAP_URL_MISSING",
        },
        expectedStatus: 400,
      },
      {
        testName: "ROADMAP_COLOR_HEX_LENGTH",
        omitField: null,
        overrideFields: { color: "fff" }, // 3 chars instead of 6
        expectedError: {
          message: "Color must be exactly 6 characters",
          code: "ROADMAP_COLOR_HEX_LENGTH",
        },
        expectedStatus: 400,
      },
      {
        testName: "ROADMAP_COLOR_HEX_CHAR",
        omitField: null,
        overrideFields: { color: "gggggg" }, // Invalid hex characters
        expectedError: {
          message: "Color must be a valid hexadecimal value",
          code: "ROADMAP_COLOR_HEX_CHAR",
        },
        expectedStatus: 400,
      },
      {
        testName: "BOOLEAN_EXPECTED for display=1",
        omitField: null,
        overrideFields: { display: 1 }, // Number instead of boolean
        expectedError: {
          message: "Boolean value expected",
          code: "BOOLEAN_EXPECTED",
        },
        expectedStatus: 400,
      },
      {
        testName: "BOOLEAN_EXPECTED for display='true'",
        omitField: null,
        overrideFields: { display: "true" }, // String instead of boolean
        expectedError: {
          message: "Boolean value expected",
          code: "BOOLEAN_EXPECTED",
        },
        expectedStatus: 400,
      },
    ];

    itEE.each(testCases)(
      "should throw error $testName",
      async ({ omitField, overrideFields, expectedError, expectedStatus }) => {
        const { user } = await createUser({
          isVerified: true,
        });
        await createRoleWithPermissions(user.userId, ["roadmap:update"], {
          roleName: "Roadmap update",
        });
        const r1 = await generateRoadmap({}, true);
        const roadmap = await generateRoadmap({}, false);

        const requestBody: IUpdateRoadmapRequestBody = {
          id: r1.id,
          name: roadmap.name,
          url: roadmap.url,
          color: roadmap.color,
          display: roadmap.display,
        };

        // Omit field if specified
        if (Array.isArray(omitField)) {
          omitField.forEach((field) => {
            requestBody[field] = undefined;
          });
        } else if (omitField) {
          requestBody[omitField] = undefined;
        }

        // Override fields if specified
        if (overrideFields) {
          Object.assign(requestBody, overrideFields);
        }

        const response = await supertest(app)
          .patch("/api/v1/roadmaps")
          .set("Authorization", `Bearer ${user.authToken}`)
          .send(requestBody);

        expect(response.headers["content-type"]).toContain("application/json");
        expect(response.status).toBe(expectedStatus);
        expect(response.body.code).toBe("VALIDATION_ERROR");
        expect(response.body.message).toBe("Invalid body parameters");
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              ...(expectedError.message && {
                message: expectedError.message,
              }),
              code: expectedError.code,
            }),
          ]),
        );
      },
    );
  });

  function makeSlugCase(input: string, expected: string) {
    const base = faker.string.alphanumeric(8).toLowerCase();
    const exp = expected === "" ? base : `${base}-${expected}`;
    return {
      url: `${base} ${input}`,
      expected: exp,
    };
  }

  const slugUpdateCases = [
    makeSlugCase("feature-requests", "feature-requests"),
    makeSlugCase("Feature Requests", "feature-requests"),
    makeSlugCase("roadmap name with spaces", "roadmap-name-with-spaces"),
    makeSlugCase("roadmap+with+plus", "roadmap-with-plus"),
    makeSlugCase("roadmap#with#hash", "roadmap-with-hash"),
    makeSlugCase("a@@@@@@@@", "a"),
    makeSlugCase("बोर्ड", ""),
    makeSlugCase("😀️😈️", ""),
    makeSlugCase("...", ""),
    makeSlugCase("../...", ""),
    makeSlugCase("Hello World!!!", "hello-world"),
    makeSlugCase("  multiple   spaces  ", "multiple-spaces"),
    makeSlugCase("UPPERCASE-SLUG", "uppercase-slug"),
  ];

  itEE.each(slugUpdateCases)(
    "should update roadmap url to '$url' → '$expected'",
    async ({ url, expected }) => {
      const roadmap = await generateRoadmap({}, true);
      const { user: authUser } = await createUser();
      await createRoleWithPermissions(authUser.userId, ["roadmap:update"], {
        roleName: "Roadmap Patcher",
      });

      const response = await supertest(app)
        .patch("/api/v1/roadmaps")
        .set("Authorization", `Bearer ${authUser.authToken}`)
        .send({
          id: roadmap.id,
          name: roadmap.name,
          url,
          color: roadmap.color,
          display: roadmap.display,
        });

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(200);

      const updated = response.body.roadmap;
      expect(updated.id).toBe(roadmap.id);
      expect(updated.url).toBe(expected);
    },
  );

  itEE("should update roadmap", async () => {
    const { user } = await createUser({
      isVerified: true,
    });
    await createRoleWithPermissions(user.userId, ["roadmap:update"], {
      roleName: "Roadmap update",
    });

    const r1 = await generateRoadmap({}, true);
    const name = "Roadmap updated!";

    const response = await supertest(app)
      .patch("/api/v1/roadmaps")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        id: r1.id,
        name,
        url: r1.url,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);

    const roadmap = response.body.roadmap;
    expect(roadmap.id).toBe(r1.id);
    expect(roadmap.name).toBe(name);
    expect(roadmap.url).toBe(r1.url);
    expect(roadmap.color).toBe(r1.color);
    expect(roadmap.display).toBe(r1.display);
    expect(roadmap.index).toBe(r1.index);
    expect(roadmap.created_at).toBe(r1.created_at);
  });

  itEE("should trim leading dashes from the updated roadmap url", async () => {
    const base = faker.string.alphanumeric(8).toLowerCase();
    const roadmap = await generateRoadmap({}, true);
    const { user: authUser } = await createUser();

    await createRoleWithPermissions(authUser.userId, ["roadmap:update"], {
      roleName: "roadmap Patcher",
    });

    const response = await supertest(app)
      .patch("/api/v1/roadmaps")
      .set("Authorization", `Bearer ${authUser.authToken}`)
      .send({
        id: roadmap.id,
        name: roadmap.name,
        url: `---${base}`,
        color: roadmap.color,
        display: roadmap.display,
      });

    expect(response.status).toBe(200);
    expect(response.body.roadmap.url).toBe(base);
  });
});

// Delete roadmaps
describeEE("DELETE /api/v1/roadmaps/", () => {
  itEE('should throw error "INVALID_AUTH_HEADER"', async () => {
    const res = await supertest(app).delete("/api/v1/roadmaps");

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_AUTH_HEADER");
  });

  itEE(
    "should throw error not having 'roadmap:destroy' permission",
    async () => {
      const { user: authUser } = await createUser({
        isVerified: true,
      });
      const r1 = await generateRoadmap({}, true);

      const response = await supertest(app)
        .delete("/api/v1/roadmaps")
        .set("Authorization", `Bearer ${authUser.authToken}`)
        .send({
          id: r1.id,
        });

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(403);
      expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
    },
  );

  itEE('should throw error "ROADMAP_NOT_FOUND"', async () => {
    const { user } = await createUser({
      isVerified: true,
    });

    const response = await supertest(app)
      .delete("/api/v1/roadmaps")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        id: uuid(),
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("ROADMAP_NOT_FOUND");
  });

  itEE("should delete roadmap", async () => {
    const { user } = await createUser({
      isVerified: true,
    });
    await createRoleWithPermissions(user.userId, ["roadmap:destroy"], {
      roleName: "Roadmap delete",
    });
    const r1 = await generateRoadmap({}, true);

    const response = await supertest(app)
      .delete("/api/v1/roadmaps")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        id: r1.id,
      });

    expect(response.status).toBe(204);
  });
});

// Sort roadmaps
describeEE("PATCH /api/v1/roadmaps/sort", () => {
  itEE('should throw error "INVALID_AUTH_HEADER"', async () => {
    const res = await supertest(app).patch("/api/v1/roadmaps/sort");

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_AUTH_HEADER");
  });

  itEE(
    "should throw error for missing 'roadmap:update' permission",
    async () => {
      const { user } = await createUser({ isVerified: true });
      const from = await generateRoadmap({}, true);
      const to = await generateRoadmap({}, true);

      const res = await supertest(app)
        .patch("/api/v1/roadmaps/sort")
        .set("Authorization", `Bearer ${user.authToken}`)
        .send({ from, to });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("NOT_ENOUGH_PERMISSION");
    },
  );

  itEE("should return 204 if from.id === to.id", async () => {
    const { user } = await createUser({ isVerified: true });
    await createRoleWithPermissions(user.userId, ["roadmap:update"], {
      roleName: "roadmap-sort",
    });
    const roadmap = await generateRoadmap({}, true);

    const res = await supertest(app)
      .patch("/api/v1/roadmaps/sort")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({ from: roadmap, to: roadmap });

    expect(res.status).toBe(204);
  });

  itEE("should successfully swap roadmap indexes", async () => {
    const { user } = await createUser({ isVerified: true });
    await createRoleWithPermissions(user.userId, ["roadmap:update"], {
      roleName: "roadmap-sort",
    });

    const r1 = await generateRoadmap({ index: 1 }, true);
    const r2 = await generateRoadmap({ index: 2 }, true);
    const res = await supertest(app)
      .patch("/api/v1/roadmaps/sort")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        from: { id: r1.id, index: r2.index },
        to: { id: r2.id, index: r1.index },
      });

    expect(res.status).toBe(200);

    const updatedR1 = await database
      .select("index")
      .from("roadmaps")
      .where({ id: r1.id })
      .first();

    const updatedR2 = await database
      .select("index")
      .from("roadmaps")
      .where({ id: r2.id })
      .first();

    expect(updatedR1.index).toBe(r2.index);
    expect(updatedR2.index).toBe(r1.index);
  });
});
