import 'reflect-metadata';
import test from 'node:test';
import assert from 'node:assert/strict';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { AddressInfo } from 'node:net';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/shared/errors/http-exception.filter';

process.env.NODE_ENV = 'test';

test('login issues a valid token and protected profile rejects missing credentials', async () => {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(0, '127.0.0.1');

  try {
    const address = app.getHttpServer().address() as AddressInfo;
    const base = 'http://127.0.0.1:' + address.port;

    const unauthorized = await fetch(base + '/pilot/me');
    assert.equal(unauthorized.status, 401);
    assert.deepEqual(await unauthorized.json(), {
      statusCode: 401,
      message: 'A bearer token is required',
      error: 'UnauthorizedException',
      path: '/pilot/me',
    });

    const invalidLogin = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'wrong', password: 'wrong' }),
    });
    assert.equal(invalidLogin.status, 401);

    const login = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'johndoe', password: 'susiairtest' }),
    });
    assert.equal(login.status, 201);
    const loginBody = await login.json() as { accessToken: string };
    assert.ok(loginBody.accessToken);

    const profile = await fetch(base + '/pilot/me', {
      headers: { authorization: 'Bearer ' + loginBody.accessToken },
    });
    assert.equal(profile.status, 200);
    assert.deepEqual(await profile.json(), {
      name: 'John Doe',
      totalFlightHours: 1444.5,
      avatarUrl: null,
    });
  } finally {
    await app.close();
  }
});
