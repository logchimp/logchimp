// modules
const generatePassword = require("omgopass");

// utils
const { hashPassword, validatePassword } = require("./password");

test("Hash empty string as password", () => {
  const hash = hashPassword("");

  expect(hash).toBeUndefined();
});

test("Validate hash random password", async () => {
  const password = generatePassword();
  const hash = hashPassword(password);
  const validPassword = await validatePassword(password, hash);

  expect(validPassword).toBeTruthy();
});

test("Validate hash random password with missing hash", async () => {
  const password = generatePassword();
  const validPassword = await validatePassword(password);

  expect(validPassword).toBeUndefined();
});

test("Validate hash random password with missing password", async () => {
  const hash = hashPassword("");
  const validPassword = await validatePassword(hash);

  expect(validPassword).toBeUndefined();
});
