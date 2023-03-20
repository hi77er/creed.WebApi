import { expect, it } from '@jest/globals';
import {
  BaseCustomError,
  DuplicatedUserError,
  USER_ALREADY_EXISTS_ERR_MSG
} from '../../errors';
import {
  IUser,
  User
} from "../../models";

it('should not save a user with a duplicate email', async () => {
  const user: IUser = {
    email: 'unique2023@email.com',
    emailVerified: false,
    firstName: 'John',
    lastName: 'Steinback'
  };

  const created = await User.create(user);
  expect(created).toBeDefined();
  expect(created.email).toEqual(user.email);
  expect(created.firstName).toEqual(user.firstName);
  expect(created.lastName).toEqual(user.lastName);

  let error: DuplicatedUserError | undefined;

  try {
    await User.create(user);
  } catch (err) {
    error = err;
  }

  const serializedErrorOutput = error ? error.serializeErrorOutput() : undefined;

  expect(error).toBeDefined();
  expect(error).toBeInstanceOf(BaseCustomError);
  expect(serializedErrorOutput).toBeDefined();
  expect(serializedErrorOutput?.errors[0].message).toEqual(USER_ALREADY_EXISTS_ERR_MSG);
});