import { expect, it } from '@jest/globals';
import { UserSignedUp } from '../';
import { User } from '../../models';

let email = 'qwert2023@gmail.com';
let password = '!234Qwer';
let firstName = 'John';
let lastName = 'Steinback';
let user = { email, password, firstName, lastName };

it('should have status code 200', async () => {
  const created = await User.create(user);
  const event = new UserSignedUp(created);

  expect(created).toBeDefined();
  expect(created.email).toEqual(user.email);
  expect(event).toBeDefined();
  expect(event.getStatusCode()).toEqual(201);
})

it('should expose only id and email when when serializing to REST', async () => {
  const created = await User.create(user);
  const event = new UserSignedUp(created);
  const serializedResponse = event.serializeRest();

  expect(created).toBeDefined();
  expect(created.email).toEqual(user.email);
  expect(event).toBeDefined();
  expect(Object.keys(serializedResponse).sort()).toEqual(['email', 'id']);
  expect(serializedResponse.id).toEqual(created._id);
  expect(serializedResponse.email).toEqual(user.email);
})