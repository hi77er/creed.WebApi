import { ValidationError } from "express-validator";
import {
  BaseCustomError,
  USER_ALREADY_EXISTS_ERR_MSG
} from ".";
import { SerializedErrorField, SerializeErrorOutput } from "./types/serialized-error-output";

export type DuplicatedUserConstructorErrorsParam = ValidationError[];

export class DuplicatedUserError extends BaseCustomError {
  private errorMessage = USER_ALREADY_EXISTS_ERR_MSG;
  protected statusCode = 422;
  protected errors: ValidationError[] | undefined;

  constructor(errors?: DuplicatedUserConstructorErrorsParam) {
    super(USER_ALREADY_EXISTS_ERR_MSG);

    this.errors = errors;

    Object.setPrototypeOf(this, DuplicatedUserError.prototype);
  }

  getStatusCode() { return this.statusCode; };
  serializeErrorOutput(): SerializeErrorOutput { return this.parseValidationErrors(); };

  private parseValidationErrors(): SerializeErrorOutput {
    const parseErrors: SerializedErrorField = {};

    if (this.errors && this.errors.length > 0) {
      this.errors.forEach((error) => {
        if (parseErrors[error.param]) {
          parseErrors[error.param].push(error.msg);
        } else {
          parseErrors[error.param] = [error.msg];
        }
      });
    }

    return {
      errors: [{
        message: this.errorMessage,
        fields: parseErrors
      }]
    };
  }
};