import request from "supertest";
import app from "../../app";
import { it } from '@jest/globals';

// INFO: Valid values
let email = 'qwert2023@gmail.com';
let password = '!234Qwer';
let firstName = 'John';
let lastName = 'Steinback';

it('should return 400 if email is missing, empty, or invalid', async () => {
  await request(app)
    .post('/auth/signup')
    .send({ password, firstName, lastName })
    .expect(400);

  await request(app)
    .post('/auth/signup')
    .send({ email: '', password, firstName, lastName })
    .expect(400);

  await request(app)
    .post('/auth/signup')
    .send({ email: 'wrong@mail@1', password, firstName, lastName })
    .expect(400);

  await request(app)
    .post('/auth/signup')
    .send({ email: '@mail', password, firstName, lastName })
    .expect(400);
});

it('should return 400 if password is missing, or empty', async () => {
  await request(app)
    .post('/auth/signup')
    .send({ email, firstName, lastName })
    .expect(400);

  await request(app)
    .post('/auth/signup')
    .send({ email, password: '', firstName, lastName })
    .expect(400);
});

it('should return 400 if password is contains less than 8 charracters', async () => {
  await request(app)
    .post('/auth/signup')
    .send({ email, password: '!23Qwe', firstName, lastName })
    .expect(400);
});

it('should return 400 if password is does not contain a special character', async () => {
  await request(app)
    .post('/auth/signup')
    .send({ email, password: '1234Qwer', firstName, lastName })
    .expect(400);
});

it('should return 400 if password is does not contain a capital leter', async () => {
  await request(app)
    .post('/auth/signup')
    .send({ email, password: '!234qwer', firstName, lastName })
    .expect(400);
});

it('should return 400 if password is does not contain a lowercase leter', async () => {
  await request(app)
    .post('/auth/signup')
    .send({ email, password: '!234QWER', firstName, lastName })
    .expect(400);
});

it('should return 400 if password is does not contain a number', async () => {
  await request(app)
    .post('/auth/signup')
    .send({ email, password: '!qwerQWER', firstName, lastName })
    .expect(400);
});

it('should return 400 if first or last name are missing, or empty', async () => {
  await request(app)
    .post('/auth/signup')
    .send({ email, password, lastName })
    .expect(400);

  await request(app)
    .post('/auth/signup')
    .send({ email, password, firstName: '', lastName })
    .expect(400);

  await request(app)
    .post('/auth/signup')
    .send({ email, password, firstName })
    .expect(400);

  await request(app)
    .post('/auth/signup')
    .send({ email, password, firstName, lastName: '' })
    .expect(400);
});