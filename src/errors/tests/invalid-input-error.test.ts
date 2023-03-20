import { expect, it } from '@jest/globals';
import {
  InvalidInputConstructorErrorsParam,
  InvalidInputError
} from '../';


it('should have status code of 422', () => {
  const error = new InvalidInputError();
  expect(error.getStatusCode()).toEqual(422);
});

it('should return the errors in serialized format', () => {
  const errors: InvalidInputConstructorErrorsParam = [{
    value: undefined,
    msg: "The 'Last name' is required.",
    param: 'lastName',
    location: 'body'
  }];

  const error = new InvalidInputError(errors);
  const serializedErrors = error.serializeErrorOutput();
  expect(serializedErrors.errors).toHaveLength(1);

  const { fields = {} } = serializedErrors.errors[0];
  expect(serializedErrors.errors[0].message).toEqual('Input does not match validation criteria.');
  expect(Object.keys(fields)).toEqual(['lastName']);
  expect(fields.lastName).toHaveLength(1);
  expect(fields.lastName).toContain("The 'Last name' is required.");
});