export class AuthenticationFailedError extends Error {
  constructor() {
    super("Authentication failed");
    this.name = "AuthenticationFailedError";
  }
}

export class UserExistsError extends Error {
  constructor() {
    super("User already exists");
    this.name = "UserExistsError";
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

export class InvalidLogChimpIdentityTokenError extends Error {
  constructor() {
    super("Invalid LogChimp Identity token");
    this.name = "InvalidLogChimpIdentityTokenError";
  }
}
