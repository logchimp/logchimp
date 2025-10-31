import { test, expect } from "vitest";
import { nanoid } from "nanoid";

// utils
import { hashPassword, validatePassword } from "./password";

test("Hash empty string as password", () => {
  const hash = hashPassword("");

  expect(hash).toBeNull();
});

test("Validate hash random password", async () => {
  const password = nanoid();
  const hash = hashPassword(password);
  const validPassword = await validatePassword(password, hash);

  expect(validPassword).toBeTruthy();
});

test("Validate hash random password with missing hash", async () => {
  const password = nanoid();
  const validPassword = await validatePassword(password, "");

  expect(validPassword).toBe(false);
});

test("Validate hash random password with missing password", async () => {
  const hash = hashPassword("");
  const validPassword = await validatePassword("", hash);

  expect(validPassword).toBe(false);
});
