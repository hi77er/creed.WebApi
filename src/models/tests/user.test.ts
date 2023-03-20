import { expect, it } from '@jest/globals';
import { IUser, User } from "../../models";

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

  let error;
  try {
    await User.create(user);
  } catch (err) {
    error = err;
  }

  expect(error).toBeDefined();
});