import type { OIDCAuthenticationErrorCode } from "./types";

export class AuthenticationFailedError extends Error {
  constructor() {
    super("Authentication failed");
    this.name = "AuthenticationFailedError";
  }
}

export class InvalidEmailError extends Error {
  constructor() {
    super("Invalid email");
    this.name = "InvalidEmailError";
  }
}

export class UserBlockedError extends Error {
  constructor() {
    super("User is blocked");
    this.name = "UserBlockedError";
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super("User not found");
    this.name = "UserNotFoundError";
  }
}

export class UserExistsError extends Error {
  constructor() {
    super("User already exists");
    this.name = "UserExistsError";
  }
}

export class PasswordMissingError extends Error {
  constructor() {
    super("Password is missing");
    this.name = "PasswordMissingError";
  }
}

export class IncorrectPasswordError extends Error {
  constructor() {
    super("Incorrect password");
    this.name = "IncorrectPasswordError";
  }
}

export class UsernameExistsError extends Error {
  constructor() {
    super("Could not generate a unique username");
    this.name = "UsernameExistsError";
  }
}

export class FailedToCreateUser extends Error {
  constructor() {
    super("Failed to create user");
    this.name = "FailedToCreateUser";
  }
}
export class OIDCAuthenticationFailedError extends Error {
  constructor(
    public readonly code: OIDCAuthenticationErrorCode,
    options?: { cause?: unknown },
  ) {
    super(`OIDC authentication failed: ${code}`, options);
    this.name = "OIDCAuthenticationFailedError";
  }
}
