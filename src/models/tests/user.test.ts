import { expect, it } from '@jest/globals';
import { ObjectId } from 'bson';
import {
  BaseCustomError,
  DuplicatedUserError,
  USER_ALREADY_EXISTS_ERR_MSG
} from '../../errors';
import {
  IUserDocument,
  User
} from "../../models";

const userData = {
  email: 'unique2023@email.com',
  emailVerified: false,
  firstName: 'John',
  lastName: 'Steinback'
};
const password = '!234Qwer';

it('should not save a user with a duplicate email', async () => {
  const created: IUserDocument = await User.register(new User(userData), password);
  expect(created).toBeDefined();
  expect(created.email).toEqual(userData.email);
  expect(created.firstName).toEqual(userData.firstName);
  expect(created.lastName).toEqual(userData.lastName);

  let error: DuplicatedUserError | undefined;

  try {
    await User.create(new User(userData));
  } catch (err) {
    error = err;
  }

  const serializedErrorOutput = error ? error.serializeErrorOutput() : undefined;

  expect(error).toBeDefined();
  expect(error).toBeInstanceOf(BaseCustomError);
  expect(serializedErrorOutput).toBeDefined();
  expect(serializedErrorOutput?.errors[0].message).toEqual(USER_ALREADY_EXISTS_ERR_MSG);
});

it('should encrypt the password when craeting the user', async () => {
  const created: IUserDocument = await User.register(new User(userData), password);
  expect(created).toBeDefined();
  expect(created.hash).toBeDefined();
  expect(created.hash).not.toEqual(password);
});