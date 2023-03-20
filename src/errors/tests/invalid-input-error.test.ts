import { expect, it } from '@jest/globals';
import {
  InvalidInputConstructorErrorsParam,
  InvalidInputError
} from '../';
import {
  INVALID_INPUT_ERR_MSG,
  REQUIRED_LAST_NAME_ERR_MSG
} from '../keys';


it('should have status code of 422', () => {
  const error = new InvalidInputError();
  expect(error.getStatusCode()).toEqual(422);
});

it('should return the errors in serialized format', () => {
  const errors: InvalidInputConstructorErrorsParam = [{
    value: undefined,
    msg: REQUIRED_LAST_NAME_ERR_MSG,
    param: 'lastName',
    location: 'body'
  }];

  const error = new InvalidInputError(errors);
  const serializedErrors = error.serializeErrorOutput();
  expect(serializedErrors.errors).toHaveLength(1);

  const { fields = {} } = serializedErrors.errors[0];
  expect(serializedErrors.errors[0].message).toEqual(INVALID_INPUT_ERR_MSG);
  expect(Object.keys(fields)).toEqual(['lastName']);
  expect(fields.lastName).toHaveLength(1);
  expect(fields.lastName).toContain(REQUIRED_LAST_NAME_ERR_MSG);
});