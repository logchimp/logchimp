import { describe, it, expect } from "vitest";
import _ from "lodash";
import generatePassword from "omgopass";

import {
  validEmail,
  validUUID,
  generateHexColor,
  hashPassword,
  validatePassword,
} from "../../helpers";

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
    const res = validUUID("");

    expect(res).toEqual("");
    expect(typeof res).toEqual("string");
  });

  it("should return empty string with random string", () => {
    const res = validUUID("&(9798709879");

    expect(res).toEqual("");
    expect(typeof res).toEqual("string");
  });

  it("should return empty string with SQL injection", () => {
    const res = validUUID("DELETE * FROM posts;");

    expect(res).toEqual("");
    expect(typeof res).toEqual("string");
  });

  it("should return empty string with empty array", () => {
    const res = validUUID([]);

    expect(res).toEqual("");
    expect(typeof res).toEqual("string");
  });

  it("should return empty string with invalid UUID in array", () => {
    const res = validUUID(["sdfs", "tevedfsad", "*****"]);

    expect(res).toEqual("");
    expect(typeof res).toEqual("string");
  });

  it("should return empty string with SQL injection in array", () => {
    const res = validUUID(['UPDATE posts SET title = "LOL"', "DELETE posts"]);

    expect(res).toEqual("");
    expect(typeof res).toEqual("string");
  });

  it("should return empty string with invalid UUID in array", () => {
    const res = validUUID([
      "48EACC70-6D5E-403F-8CC2-AD945A3F3C",
      "E82739-FB69-4F06-9FEE-184CC834A492",
      "7D663644-5714-42-8A34-C34971A48A45",
      "BC8F29C0-5813-4162-94-7EB137CD2B13",
    ]);

    expect(res).toEqual("");
    expect(typeof res).toEqual("string");
  });

  it("should return array of UUID with array of valid UUID", () => {
    const res = validUUID([
      "12E67136-3A19-4F71-9B41-DA8CE61BC80F",
      "D7573C0E-7909-448C-BA1D-6B29042F95C8",
    ]);

    expect(res).toEqual([
      "12E67136-3A19-4F71-9B41-DA8CE61BC80F",
      "D7573C0E-7909-448C-BA1D-6B29042F95C8",
    ]);
    expect(_.isArray(res)).toBeTruthy();
  });

  it("should return UUID with valid UUID", () => {
    const res = validUUID("1A3578E2-9594-4DDD-8D98-ACC55B1D6F99");

    expect(res).toEqual("1A3578E2-9594-4DDD-8D98-ACC55B1D6F99");
    expect(typeof res).toEqual("string");
  });
});

describe("generateHexColor", () => {
  it("should generate 6 digit HEX color code", () => {
    const color = generateHexColor();
    const result = /^#([a-fA-F0-9]){3}$|[a-fA-F0-9]{6}$/gi.test(color);

    expect(result).toBeTruthy();
  });
});

describe("hashPassword and validatePassword", () => {
  it("should not hash empty string as password", () => {
    const hash = hashPassword("");

    expect(hash).toEqual(null);
  });

  it("should validate hash random password", () => {
    const password = generatePassword();
    const hash = hashPassword(password);
    const validPassword = validatePassword(password, hash);

    expect(validPassword).toBeTruthy();
  });

  it("should validate hash random password with missing hash", () => {
    const password = generatePassword();
    const validPassword = validatePassword(password);

    expect(validPassword).toEqual(null);
  });

  it("should validate hash random password with missing password", () => {
    const hash = hashPassword("");
    const validPassword = validatePassword("", hash);

    expect(validPassword).toEqual(null);
  });
});
