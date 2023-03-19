import request from "supertest";
import app from "../../app";
import { it } from '@jest/globals';

it('should return 400 if email is not valid', async () => {
  await request(app).post('/auth/signup').expect(400);
});
