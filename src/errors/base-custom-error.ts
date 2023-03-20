import { ValidationError } from "express-validator";
import { SerializeErrorOutput } from "./types/serialized-error-output";

export abstract class BaseCustomError extends Error {
  protected abstract statusCode: number;

  protected abstract errors: ValidationError[] | undefined;

  protected constructor(message?: string) {
    super(message || 'something went wrong');

    Object.setPrototypeOf(this, BaseCustomError.prototype);
  }

  abstract getStatusCode(): number;
  abstract serializeErrorOutput(): SerializeErrorOutput;
};