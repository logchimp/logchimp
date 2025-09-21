import { describe, it, expect } from "vitest";
import _ from "lodash";

import {
  validEmail,
  validUUID,
  generateHexColor,
  sanitiseName,
  sanitiseUsername,
  validUUIDs,
  parseAndValidatePage,
  parseAndValidateLimit,
  generateNanoID,
} from "../../src/helpers";

describe("validate email", () => {
  it('should be a valid email "yashu@codecarrot.net"', () => {
    const response = validEmail("yashu@codecarrot.net");
    expect(response).toBeTruthy();
  });

  it('should be a valid email "ya___u@codecarrot.net"', () => {
    const response = validEmail("ya___u@codecarrot.net");
    expect(response).toBeTruthy();
  });

  it('should be a valid email "ya___u@codecarrot.nt"', () => {
    const response = validEmail("ya___u@codecarrot.nt");
    expect(response).toBeTruthy();
  });

  it('should be a valid email "y@codecarrot.nt"', () => {
    const response = validEmail("y@codecarrot.nt");
    expect(response).toBeTruthy();
  });

  it('should be a valid email "y@codecarr.otn"', () => {
    const response = validEmail("y@codecar.rotn");
    expect(response).toBeTruthy();
  });

  it('should not be a valid email "y@codecarrot.n"', () => {
    const response = validEmail("y@codecarrot.n");
    expect(response).toBeFalsy();
  });

  it('should not be a valid email "y@codecarrotn"', () => {
    const response = validEmail("y@codecarrotn");
    expect(response).toBeFalsy();
  });

  it('should not be a valid email "y@codecarrotn@"', () => {
    const response = validEmail("y@codecarrotn@");
    expect(response).toBeFalsy();
  });

  it('should not be a valid email "y@codecarr.otn@"', () => {
    const response = validEmail("y@codecar.rotn@");
    expect(response).toBeFalsy();
  });

  it('should not be a valid email "y@code$%&$%carrot.n"', () => {
    const response = validEmail("y@code$%&$%carrot.n");
    expect(response).toBeFalsy();
  });

  it('should not be a valid email "^#^3y@code$%&$%carrot.n"', () => {
    const response = validEmail("^#^3y@code$%&$%carrot.n");
    expect(response).toBeFalsy();
  });

  it('should not be a valid email "___yashu@carrot.n"', () => {
    const response = validEmail("___yashu@carrot.n");
    expect(response).toBeFalsy();
  });
});

describe("validate UUID", () => {
  it("should return empty string with empty string", () => {
    const value = validUUID("");
    expect(value).toBeNull();
  });

  it("should return empty string with random string", () => {
    const value = validUUID("&(9798709879");
    expect(value).toBeNull();
  });

  it("should return empty string with SQL injection", () => {
    const value = validUUID("DELETE * FROM posts;");
    expect(value).toBeNull();
  });

  it("should return UUID with valid UUID", () => {
    const value = validUUID("1A3578E2-9594-4DDD-8D98-ACC55B1D6F99");

    expect(value).toBe("1A3578E2-9594-4DDD-8D98-ACC55B1D6F99");
    expect(typeof value).toBe("string");
  });
});

describe("validate UUIDs", () => {
  it("should return empty string with empty array", () => {
    const value = validUUIDs([]);
    expect(value).toStrictEqual([]);
  });

  it("should return empty string with invalid UUID in array", () => {
    const value = validUUIDs(["sdfs", "tevedfsad", "*****"]);
    expect(value).toStrictEqual([]);
  });

  it("should return empty string with SQL injection in array", () => {
    const value = validUUIDs([
      'UPDATE posts SET title = "LOL"',
      "DELETE posts",
    ]);
    expect(value).toStrictEqual([]);
  });

  it("should return empty string with invalid UUID in array", () => {
    const value = validUUIDs([
      "48EACC70-6D5E-403F-8CC2-AD945A3F3C",
      "E82739-FB69-4F06-9FEE-184CC834A492",
      "7D663644-5714-42-8A34-C34971A48A45",
      "BC8F29C0-5813-4162-94-7EB137CD2B13",
    ]);
    expect(value).toStrictEqual([]);
  });

  it("should return array of UUID with array of valid UUID", () => {
    const value = validUUIDs([
      "12E67136-3A19-4F71-9B41-DA8CE61BC80F",
      "D7573C0E-7909-448C-BA1D-6B29042F95C8",
    ]);
    expect(value).toEqual([
      "12E67136-3A19-4F71-9B41-DA8CE61BC80F",
      "D7573C0E-7909-448C-BA1D-6B29042F95C8",
    ]);
    expect(_.isArray(value)).toBeTruthy();
  });
});

describe("generateHexColor", () => {
  it("should generate 6 digit HEX color code", () => {
    const color = generateHexColor();
    const result = /^#([a-fA-F0-9]){3}$|[a-fA-F0-9]{6}$/gi.test(color);

    expect(result).toBeTruthy();
  });
});

describe("sanitise username", () => {
  it('should return "Yashu.Code"', () => {
    const res = sanitiseUsername("Yashu.Code");

    expect(res).toBe("Yashu.Code");
    expect(typeof res).toBe("string");
  });

  it('should strip spaces → "AlbertREW"', () => {
    const res = sanitiseUsername("   Albert   REW    ");

    expect(res).toBe("AlbertREW");
    expect(typeof res).toBe("string");
  });

  it('should keep underscores → "john_doe"', () => {
    const res = sanitiseUsername("john_doe");

    expect(res).toBe("john_doe");
    expect(typeof res).toBe("string");
  });

  it('should keep hyphens → "user-name"', () => {
    const res = sanitiseUsername("user-name");

    expect(res).toBe("user-name");
    expect(typeof res).toBe("string");
  });

  it('should strip invalid chars → "badname"', () => {
    const res = sanitiseUsername("bad|name!!");

    expect(res).toBe("badname");
    expect(typeof res).toBe("string");
  });

  it("should truncate usernames longer than 30 chars", () => {
    const res = sanitiseUsername(
      "averylllllllllllllooooooooonnnnnnngggggggggusername",
    );

    expect(res.length).toBeLessThanOrEqual(30);
    expect(typeof res).toBe("string");
  });

  it("should return empty string for null input", () => {
    const res = sanitiseUsername(null);

    expect(res).toBe("");
    expect(typeof res).toBe("string");
  });

  it("should return empty string for non-string input (number)", () => {
    const res = sanitiseUsername(12345);

    expect(res).toBe("");
    expect(typeof res).toBe("string");
  });

  it('should strip non-latin chars → "123"', () => {
    const res = sanitiseUsername("超長用戶名123");

    expect(res).toBe("123");
    expect(typeof res).toBe("string");
  });

  it("should handle empty string input", () => {
    const res = sanitiseUsername("");

    expect(res).toBe("");
    expect(typeof res).toBe("string");
  });
});

describe("sanitise name", () => {
  it('should return "Yash Code"', () => {
    const res = sanitiseName("Yash Code");

    expect(res).toBe("Yash Code");
    expect(typeof res).toBe("string");
  });

  it('should return "Sydnee.Oconner"', () => {
    const res = sanitiseName("Sydnee.Oconner");

    expect(res).toBe("Sydnee.Oconner");
    expect(typeof res).toBe("string");
  });

  it('should return "Anne-Marie"', () => {
    const res = sanitiseName("Anne-Marie");

    expect(res).toBe("Anne-Marie");
    expect(typeof res).toBe("string");
  });

  it('should return "O\'Connor"', () => {
    const res = sanitiseName("O'Connor");

    expect(res).toBe("O'Connor");
    expect(typeof res).toBe("string");
  });

  it('should trim spaces and return "John Doe"', () => {
    const res = sanitiseName("   John Doe   ");

    expect(res).toBe("John Doe");
    expect(typeof res).toBe("string");
  });

  it('should remove symbols and return "MrSmith"', () => {
    const res = sanitiseName("Mr.@Smith!");

    expect(res).toBe("Mr.Smith");
    expect(typeof res).toBe("string");
  });

  it('should keep multiple spaces inside and return "Mary Ann"', () => {
    const res = sanitiseName("Mary   Ann");

    expect(res).toBe("Mary   Ann");
    expect(typeof res).toBe("string");
  });

  it("should return empty string for null", () => {
    const res = sanitiseName(null);

    expect(res).toBe("");
    expect(typeof res).toBe("string");
  });

  it("should return empty string for numbers", () => {
    const res = sanitiseName(12345);

    expect(res).toBe("");
    expect(typeof res).toBe("string");
  });
});

describe("parse and validate page", () => {
  it("defaults to 1 when value is undefined", () => {
    expect(parseAndValidatePage()).toBe(1);
  });

  it("defaults to 1 when value is empty string", () => {
    expect(parseAndValidatePage("")).toBe(1);
  });

  it("defaults to 1 when value is non-numeric", () => {
    expect(parseAndValidatePage("abc")).toBe(1);
  });

  it("defaults to 1 when value is 0", () => {
    expect(parseAndValidatePage("0")).toBe(1);
  });

  it("defaults to 1 when value is negative", () => {
    expect(parseAndValidatePage("-5")).toBe(1);
  });

  it("returns the integer when value is a valid positive integer", () => {
    expect(parseAndValidatePage("5")).toBe(5);
  });

  it("floors a float value", () => {
    expect(parseAndValidatePage("3.7")).toBe(3);
  });

  it("caps the value at PAGE_UPPER_LIMIT (99999999)", () => {
    expect(parseAndValidatePage("100000000000")).toBe(99999999);
  });
});

describe("parseAndValidateLimit", () => {
  const max = 50;

  it("returns max when value is empty string", () => {
    expect(parseAndValidateLimit("", max)).toBe(max);
  });

  it("returns max when value is non-numeric", () => {
    expect(parseAndValidateLimit("abc", max)).toBe(max);
  });

  it("returns value when less than max", () => {
    expect(parseAndValidateLimit("10", max)).toBe(10);
  });

  it("caps the value at max when greater than max", () => {
    expect(parseAndValidateLimit("100", max)).toBe(max);
  });

  it("returns max when value is negative", () => {
    expect(parseAndValidateLimit("-5", max)).toBe(50);
  });

  it("return max when value is set to 0", () => {
    expect(parseAndValidateLimit("0", max)).toBe(0);
  });

  it("floors a float value", () => {
    expect(parseAndValidateLimit("7.5", max)).toBe(7);
  });
});

describe("generateNanoID", () => {
  const nanoIdRegex = /^[_0-9a-z]+$/;
  it("should create a random ID of length 2 if length <= 2", () => {
    const randomId = generateNanoID(Number.MIN_SAFE_INTEGER);
    expect(randomId.length).toBe(2);
    expect(randomId).toMatch(nanoIdRegex);
  });

  it("should create a random ID of length 37 if length >= 37", () => {
    const randomId = generateNanoID(Number.MAX_SAFE_INTEGER);
    expect(randomId.length).toBe(37);
    expect(randomId).toMatch(nanoIdRegex);
  });

  it("should create a random ID only using [_a-z0-9]", () => {
    for (let length = 2; length < 10; length++) {
      const randomId = generateNanoID(length);
      expect(randomId.length).toBe(length);
      expect(randomId).toMatch(nanoIdRegex);
    }
  });
});
