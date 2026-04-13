export enum ErrorCode {
  // Auth

  // User

  // Posts

  // Votes
  VOTE_NOT_FOUND = "VOTE_NOT_FOUND",
  VOTE_EXISTS = "VOTE_EXISTS",

  // Boards

  // Roadmaps

  // Comments

  // Settings
}

export class NotFoundError extends Error {
  public readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "NotFoundError";
    this.code = code;
  }
}

export class ValidationError extends Error {
  public readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "ValidationError";
    this.code = code;
  }
}

export class ConflictError extends Error {
  public readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "ConflictError";
    this.code = code;
  }
}
