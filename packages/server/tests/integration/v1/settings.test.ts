import { beforeAll, describe, expect, it } from "vitest";
import supertest from "supertest";
import type { IAuthUser } from "@logchimp/types";
import { faker } from "@faker-js/faker";

import app from "../../../src/app";
import * as cache from "../../../src/cache";
import { createUser } from "../../utils/seed/user";
import { createRoleWithPermissions } from "../../utils/createRoleWithPermissions";
import { updateSettings } from "../../utils/seed/settings";
import { CACHE_KEYS } from "../../../src/cache/keys";

describe("GET /api/v1/settings/site", () => {
  it("should get all settings", async () => {
    const { user } = await createUser();
    await createRoleWithPermissions(user.userId, ["settings:update"], {
      roleName: "Settings update",
    });

    // start - update site data
    const title = "LogChimp";
    const description = "Track user feedback to build better products";
    const logo =
      "https://cdn.logchimp.codecarrot.net/logchimp_circular_logo.png";
    const color = faker.color.rgb({
      format: "hex",
      casing: "lower",
      prefix: "",
    });
    const updateLabs = {
      comments: faker.datatype.boolean(),
    };
    await updateSettings({
      title,
      description,
      logo,
      accentColor: color,
      allowSignup: true,
      isPoweredBy: true,
      developer_mode: false,
      labs: updateLabs,
    });
    // end - update site data

    const response = await supertest(app).get("/api/v1/settings/site");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.headers["x-cache"]).toBe("MISS");
    expect(response.status).toBe(200);

    const settings = response.body.settings;
    expect(settings.title).toBe(title);
    expect(settings.description).toBe(description);
    expect(settings.logo).toBe(logo);
    expect(settings.icon).toBe(logo);
    expect(settings.accentColor).toBe(color);
    expect(settings.isPoweredBy).toBeTruthy();
    expect(settings.allowSignup).toBeTruthy();
    expect(settings.developer_mode).toBeFalsy();
    // expect(settings.googleAnalyticsId).toBeNull();

    // labs
    expect(settings.labs.comments).toBe(updateLabs.comments);
  });
});

describe("PATCH /api/v1/settings/site", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).patch("/api/v1/settings/site");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should not have permission 'settings:update'", async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .patch("/api/v1/settings/site")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  describe("should validate logo url", () => {
    let user: IAuthUser;
    beforeAll(async () => {
      const authUser = await createUser();
      user = authUser.user;
      await createRoleWithPermissions(
        authUser.user.userId,
        ["settings:update"],
        {
          roleName: "Settings update",
        },
      );
    });

    [
      // 1. XSS Injection Attempts
      `https://images.pexels.com/photos/2681319/pexels-photo-2681319"/onError="alert('i_win_hehe')".jpeg`,
      `https://example.com/image.jpg" onload="alert('XSS')"`,
      `https://example.com/image.jpg" onerror="alert(document.cookie)"`,
      `https://example.com/image.jpg" onmouseover="alert('XSS')"`,
      `https://example.com/image.jpg"><script>alert('XSS')</script>`,
      `https://example.com/image.jpg'><img src=x onerror=alert('XSS')>`,
      `https://example.com/image.jpg\\" onError=\\"alert(1)\\"`,
      `https://example.com/image.jpg" style="background:url(javascript:alert('XSS'))"`,

      // 2. JavaScript Protocol Injection
      `javascript:alert('XSS')`,
      `JAVASCRIPT:alert('XSS')`, // Case variation
      `javascript://comment%0Aalert('XSS')`,
      `javascript:void(0);alert('XSS')`,
      `javascript:/*comment*/alert('XSS')`,
      `java\u0073cript:alert('XSS')`, // Unicode bypass

      // 3. Data URI Attacks
      `data:text/html,<script>alert('XSS')</script>`,
      `data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4=`, // Base64 encoded script
      `data:image/svg+xml,<svg onload=alert('XSS')></svg>`,
      `data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoJ1hTUycpPjwvc3ZnPg==`,
      `data:text/javascript,alert('XSS')`,

      // 4. VBScript and Other Protocols
      `vbscript:msgbox("XSS")`,
      `livescript:alert('XSS')`,
      `mocha:alert('XSS')`,
      `charset:alert('XSS')`,

      // 5. URL Encoding Bypasses
      `https://example.com/image.jpg%22onload=%22alert(1)%22`,
      `https://example.com/image.jpg%27onmouseover=%27alert(1)%27`,
      `https://example.com/image.jpg%3Cscript%3Ealert(1)%3C/script%3E`,
      `javascript%3Aalert('XSS')`,
      `%6A%61%76%61%73%63%72%69%70%74%3A%61%6C%65%72%74%28%31%29`, // Full encoding

      // 6. HTML Entity Encoding
      `https://example.com/image.jpg&#34;onload=&#34;alert(1)&#34;`,
      `https://example.com/image.jpg&#x22;onload=&#x22;alert(1)&#x22;`,
      `javascript&#58;alert('XSS')`,
      `&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;`,

      // 7. Mixed Case and Whitespace Bypasses
      `JaVaScRiPt:alert('XSS')`,
      `java\tscript:alert('XSS')`, // Tab
      `java\nscript:alert('XSS')`, // Newline
      `java\rscript:alert('XSS')`, // Carriage return
      `java script:alert('XSS')`, // Space

      // 8. File Protocol Attacks
      `file:///etc/passwd`,
      `file:///C:/Windows/System32/drivers/etc/hosts`,
      `file://localhost/etc/passwd`,

      // 9. SSRF (Server-Side Request Forgery) Attempts
      `http://localhost:22/`,
      `http://127.0.0.1:8080/admin`,
      `http://169.254.169.254/latest/meta-data/`, // AWS metadata
      `http://metadata.google.internal/computeMetadata/v1/`, // GCP metadata
      `http://[::1]:22/`, // IPv6 localhost
      `http://0x7f000001/`, // Hex encoded localhost
      `http://2130706433/`, // Decimal encoded localhost

      // 10. Path Traversal in URLs
      `https://example.com/../../../etc/passwd`,
      `https://example.com/image.jpg/../../../etc/passwd`,
      `https://example.com/image.jpg%2F..%2F..%2F..%2Fetc%2Fpasswd`,

      // 11. SQL Injection Attempts (if URL gets processed by database)
      `https://example.com/image.jpg'; DROP TABLE users; --`,
      `https://example.com/image.jpg' OR '1'='1`,
      `https://example.com/image.jpg' UNION SELECT * FROM users --`,

      // 12. Command Injection
      `https://example.com/image.jpg; ls -la`,
      `https://example.com/image.jpg | cat /etc/passwd`,
      `https://example.com/image.jpg && rm -rf /`,
      "https://example.com/image.jpg`date`", // Backticks
      `https://example.com/image.jpg$(whoami)`,

      // 13. LDAP Injection
      `https://example.com/image.jpg*)(uid=*))(|(uid=*`,

      // 14. XML/XXE Attacks
      `https://example.com/image.jpg<?xml version="1.0"?><!DOCTYPE test [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><test>&xxe;</test>`,

      // 15. Long URLs (Buffer Overflow)
      `https://example.com/${"A".repeat(10000)}.jpg`,
      `https://example.com/image.jpg${`?param=${"X".repeat(5000)}`}`,

      // 16. Null Byte Injection
      `https://example.com/image.jpg\x00.txt`,
      `https://example.com/image.jpg%00.txt`,

      // 17. Unicode and UTF-8 Bypasses
      `https://example.com/image.jpg\u0022onload\u003dalert(1)\u0022`,
      `https://example.com/image.jpg\u003cscript\u003ealert(1)\u003c/script\u003e`,

      // 18. CSS Expression Attacks
      `https://example.com/image.jpg" style="background:expression(alert('XSS'))"`,
      `https://example.com/image.jpg" style="x:expression(alert('XSS'))"`,

      // 19. Import/Include Attacks
      `@import url(javascript:alert('XSS'));`,
      `https://example.com/image.jpg" style="@import 'javascript:alert(1)'"`,

      // 20. Template Injection
      `https://example.com/{{7*7}}.jpg`,
      `https://example.com/#{7*7}.jpg`,
      `https://example.com/<%= 7*7 %>.jpg`,

      // 21. NoSQL Injection
      `https://example.com/image.jpg'; return db.users.find(); var dummy='`,
      `https://example.com/image.jpg'||'1'=='1`,

      // 22. CRLF Injection
      `https://example.com/image.jpg\r\nSet-Cookie: admin=true`,
      `https://example.com/image.jpg%0D%0ASet-Cookie: admin=true`,

      // 23. Double Encoding Bypasses
      `https://example.com/image.jpg%252522onload%25253dalert(1)%252522`,
      `%25%36%61%25%36%31%25%37%36%25%36%31%25%37%33%25%36%33%25%37%32%25%36%39%25%37%30%25%37%34%25%33%61%25%36%31%25%36%63%25%36%35%25%37%32%25%37%34%25%32%38%25%32%37%25%35%38%25%35%33%25%35%33%25%32%37%25%32%39`,

      // 24. Polyglot Payloads (work in multiple contexts)
      `javascript:/*--></title></style></textarea></script></xmp><svg/onload='+/"/+/onmouseover=1/+/[*/[]/+alert(1)//'>`,
      `'"--></style></script><script>alert(String.fromCharCode(88,83,83))</script>`,

      // 25. Edge Cases
      // TODO: when the `req.body` contains no updatable fields
      // "", // Empty string
      " ", // Just whitespace
      `https://`, // Incomplete URL
      `://example.com/image.jpg`, // Missing protocol
      `https:///image.jpg`, // Missing host
      `https://example.com:999999/image.jpg`, // Invalid port
      `https://.example.com/image.jpg`, // Invalid host
      `https://example.com/image.jpg?param=value&param=value2&${"param=value&".repeat(1000)}`, // Excessive query params
    ].map((url, index) =>
      it(`should sanitise vulnerable URL #${index + 1}: '${url.substring(0, 100)}${url.length > 100 ? "..." : ""}'`, async () => {
        const response = await supertest(app)
          .patch("/api/v1/settings/site")
          .set("Authorization", `Bearer ${user.authToken}`)
          .send({
            logo: url,
          });

        if (response.status === 200) {
          expect(response.headers["content-type"]).toContain(
            "application/json",
          );
          // validate success

          // expect site settings from cache
          const getSiteSettingsCache = await cache.valkey.get(
            CACHE_KEYS.SITE_SETTINGS,
          );
          expect(getSiteSettingsCache).toBeNull();
        } else if (response.status === 400) {
          expect(response.headers["content-type"]).toContain(
            "application/json",
          );
          expect(response.body.code).toBe("INVALID_LOGO_URL");
          expect(response.status).toBe(400);
        } else if (response.status === 304) {
          expect(response.headers["content-type"]).toBeUndefined();
        } else {
          throw new Error(
            `Unexpected status ${response.status} for URL: ${url}`,
          );
        }
      }),
    );
  });

  it('should throw error "INVALID_ACCENT_COLOR" for "not-a-color" accent color ', async () => {
    const { user } = await createUser();
    await createRoleWithPermissions(user.userId, ["settings:update"], {
      roleName: "Settings update",
    });

    const response = await supertest(app)
      .patch("/api/v1/settings/site")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        accentColor: "not-a-color",
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);

    expect(response.body.code).toBe("INVALID_ACCENT_COLOR");
    expect(response.body.message).toBe("Invalid accent color");
  });

  it("should remove accent color when 'null' is passed", async () => {
    const { user } = await createUser();
    await createRoleWithPermissions(user.userId, ["settings:update"], {
      roleName: "Settings update",
    });

    const res = await supertest(app)
      .patch("/api/v1/settings/site")
      .send({ accentColor: null })
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(200);

    const settings = res.body.settings;
    expect(settings.accentColor).toBeNull();

    const getSiteSettingsCache = await cache.valkey.get(
      CACHE_KEYS.SITE_SETTINGS,
    );
    expect(getSiteSettingsCache).toBeNull();
  });

  it("should remove accent color when 'empty' string is passed", async () => {
    const { user } = await createUser();
    await createRoleWithPermissions(user.userId, ["settings:update"], {
      roleName: "Settings update",
    });

    const res = await supertest(app)
      .patch("/api/v1/settings/site")
      .send({ accentColor: "" })
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(200);

    const settings = res.body.settings;
    expect(settings.accentColor).toBeNull();

    const getSiteSettingsCache = await cache.valkey.get(
      CACHE_KEYS.SITE_SETTINGS,
    );
    expect(getSiteSettingsCache).toBeNull();
  });

  it("should not touch accent color if not provided", async () => {
    const { user } = await createUser();
    await createRoleWithPermissions(user.userId, ["settings:update"], {
      roleName: "Settings update",
    });

    const response = await supertest(app).get("/api/v1/settings/site");

    const res = await supertest(app)
      .patch("/api/v1/settings/site")
      .send({ title: "new title" })
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.status).toBe(200);

    const settings = res.body.settings;
    expect(settings.accentColor).toBe(response.body.settings.accentColor);

    const getSiteSettingsCache = await cache.valkey.get(
      CACHE_KEYS.SITE_SETTINGS,
    );
    expect(getSiteSettingsCache).toBeNull();
  });

  it("should update site settings", async () => {
    const { user } = await createUser();
    await createRoleWithPermissions(user.userId, ["settings:update"], {
      roleName: "Settings update",
    });

    const title = faker.commerce.productName();
    const accentColor = faker.color.rgb({
      format: "hex",
      casing: "lower",
      prefix: "",
    });
    const response = await supertest(app)
      .patch("/api/v1/settings/site")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send({
        title,
        accentColor,
      });

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(200);

    const settings = response.body.settings;
    expect(settings.title).toBe(title);
    expect(settings.accentColor).toBe(accentColor);

    const getSiteSettingsCache = await cache.valkey.get(
      CACHE_KEYS.SITE_SETTINGS,
    );
    expect(getSiteSettingsCache).toBeNull();
  });
});

describe("GET /api/v1/settings/labs", () => {
  it("should get all labs [with MISS cache]", async () => {
    const { user } = await createUser();
    await createRoleWithPermissions(user.userId, ["settings:update"], {
      roleName: "Settings update",
    });

    const updateLabs = {
      comments: faker.datatype.boolean(),
    };

    await supertest(app)
      .patch("/api/v1/settings/labs")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send(updateLabs);

    if (cache.isActive) {
      await cache.valkey.del(CACHE_KEYS.LABS_SETTINGS);
    }

    const response = await supertest(app).get("/api/v1/settings/labs");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.headers["x-cache"]).toBe("MISS");
    expect(response.status).toBe(200);

    const labs = response.body.labs;
    expect(labs.comments).toBe(updateLabs.comments);
  });

  it.skip("should get all labs [with HIT cache]", async () => {
    const { user } = await createUser();
    await createRoleWithPermissions(user.userId, ["settings:update"], {
      roleName: "Settings update",
    });

    // mimic cache miss behavior by deleting the cache
    if (cache.isActive) {
      await cache.valkey.del(CACHE_KEYS.LABS_SETTINGS);
    }

    const updateLabs = {
      comments: faker.datatype.boolean(),
    };
    await supertest(app)
      .patch("/api/v1/settings/labs")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send(updateLabs);

    const response = await supertest(app).get("/api/v1/settings/labs");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.headers["x-cache"]).toBe("HIT");
    expect(response.status).toBe(200);

    const labs = response.body.labs;
    expect(labs.comments).toBe(updateLabs.comments);
  });
});

describe("PATCH /api/v1/settings/labs", () => {
  it('should throw error "INVALID_AUTH_HEADER"', async () => {
    const response = await supertest(app).patch("/api/v1/settings/labs");

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_AUTH_HEADER");
  });

  it("should not have permission 'settings:update'", async () => {
    const { user } = await createUser();

    const response = await supertest(app)
      .patch("/api/v1/settings/labs")
      .set("Authorization", `Bearer ${user.authToken}`);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("NOT_ENOUGH_PERMISSION");
  });

  it("should update labs settings", async () => {
    const { user } = await createUser();
    await createRoleWithPermissions(user.userId, ["settings:update"], {
      roleName: "Settings update",
    });

    const updateLabs = {
      comments: faker.datatype.boolean(),
    };
    await supertest(app)
      .patch("/api/v1/settings/labs")
      .set("Authorization", `Bearer ${user.authToken}`)
      .send(updateLabs);

    if (cache.isActive) {
      const getCachedDataStr = await cache.valkey.get(CACHE_KEYS.LABS_SETTINGS);
      expect(getCachedDataStr).toBeDefined();
      expect(JSON.parse(getCachedDataStr)).toEqual(updateLabs);
    }
  });
});
