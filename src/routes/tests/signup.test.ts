import request from "supertest";
import app from "../../app";
import { expect, it } from '@jest/globals';
import { IUserDocument, User } from "../../models";

// INFO: Valid values
let email = 'qwert2023@gmail.com';
let password = '!234Qwer';
let firstName = 'John';
let lastName = 'Steinback';
let user = { email, password, firstName, lastName };

it('should return 422 if email is missing, or empty', async () => {
  await request(app)
    .post('/auth/signup')
    .send({ password, firstName, lastName })
    .expect(422);

  await request(app)
    .post('/auth/signup')
    .send({ email: '', password, firstName, lastName })
    .expect(422);
});

it('should return 422 if email is invalid', async () => {
  await request(app)
    .post('/auth/signup')
    .send({ email: 'wrong@mail@1', password, firstName, lastName })
    .expect(422);

  await request(app)
    .post('/auth/signup')
    .send({ email: '@mail', password, firstName, lastName })
    .expect(422);
});

it('should return 422 if password is missing, or empty', async () => {
  await request(app)
    .post('/auth/signup')
    .send({ email, firstName, lastName })
    .expect(422);

  await request(app)
    .post('/auth/signup')
    .send({ email, password: '', firstName, lastName })
    .expect(422);
});

it('should return 422 if password is contains less than 8 charracters', async () => {
  await request(app)
    .post('/auth/signup')
    .send({ email, password: '!23Qwe', firstName, lastName })
    .expect(422);
});

it('should return 422 if password is does not contain a special character', async () => {
  await request(app)
    .post('/auth/signup')
    .send({ email, password: '1234Qwer', firstName, lastName })
    .expect(422);
});

it('should return 422 if password is does not contain a capital leter', async () => {
  await request(app)
    .post('/auth/signup')
    .send({ email, password: '!234qwer', firstName, lastName })
    .expect(422);
});

it('should return 422 if password is does not contain a lowercase leter', async () => {
  await request(app)
    .post('/auth/signup')
    .send({ email, password: '!234QWER', firstName, lastName })
    .expect(422);
});

it('should return 422 if password is does not contain a number', async () => {
  await request(app)
    .post('/auth/signup')
    .send({ email, password: '!qwerQWER', firstName, lastName })
    .expect(422);
});

it('should return 422 if first or last name are missing, or empty', async () => {
  await request(app)
    .post('/auth/signup')
    .send({ email, password, lastName })
    .expect(422);

  await request(app)
    .post('/auth/signup')
    .send({ email, password, firstName: '', lastName })
    .expect(422);

  await request(app)
    .post('/auth/signup')
    .send({ email, password, firstName })
    .expect(422);

  await request(app)
    .post('/auth/signup')
    .send({ email, password, firstName, lastName: '' })
    .expect(422);
});

it('should save the signed up user to the database if the input data is valid', async () => {
  const response = await request(app).post('/auth/signup').send(user).expect(201);
  expect(response.body.email).toBeDefined();
  expect(response.body.email).toEqual(user.email);
  expect(response.body.id).toBeDefined();

  const registeredUser = await User.findOne({ email: user.email });

  expect(registeredUser).toBeDefined();
  expect(registeredUser).not.toBeNull();
  expect(registeredUser!.email).toEqual(user.email);
  expect(registeredUser!.firstName).toEqual(user.firstName);
  expect(registeredUser!.lastName).toEqual(user.lastName);
});

it('does not allow saving a user with a duplicate email', async () => {
  await request(app).post('/auth/signup').send(user).expect(201);
  await request(app).post('/auth/signup').send(user).expect(422);
});

it('should encrypt the password when a new user is signied up', async () => {
  const response = await request(app).post('/auth/signup').send(user).expect(201);

  const registeredUser = await User.findByUsername(response.body.email, true);
  expect(registeredUser).toBeDefined();
  expect(registeredUser).not.toBeNull();
  expect(registeredUser.hash?.length || 0).toBeGreaterThan(0);
  expect(registeredUser.hash).not.toEqual(user.password);
});