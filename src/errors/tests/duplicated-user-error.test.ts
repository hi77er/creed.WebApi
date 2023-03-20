import { expect, it } from '@jest/globals';
import { DuplicatedUserError } from '..';


it('should have status code of 422', () => {
  const error = new DuplicatedUserError();
  expect(error.getStatusCode()).toEqual(422);
});

it('should return the errors in the serialized format', () => {
  const error = new DuplicatedUserError();
  const serializedErrorOutput = error.serializeErrorOutput();

  expect(serializedErrorOutput.errors).toHaveLength(1);
  expect(serializedErrorOutput.errors[0].message).toEqual('A user with this email already exists.');
});