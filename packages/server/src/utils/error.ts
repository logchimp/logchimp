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
