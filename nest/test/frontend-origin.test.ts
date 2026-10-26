import test from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedFrontendOrigin } from '../src/shared/http/frontend-origin';

const configured = ['http://localhost:3000'];

test('configured frontend origins remain allowed', () => {
  assert.equal(isAllowedFrontendOrigin('http://localhost:3000', configured, false), true);
});

test('private IPv4 frontend origins are allowed for local development', () => {
  assert.equal(isAllowedFrontendOrigin('http://192.168.1.24:3000', configured, true), true);
  assert.equal(isAllowedFrontendOrigin('http://10.0.0.12:3000', configured, true), true);
  assert.equal(isAllowedFrontendOrigin('http://172.20.4.3:3000', configured, true), true);
});

test('private network origins are denied in production', () => {
  assert.equal(isAllowedFrontendOrigin('http://192.168.1.24:3000', configured, false), false);
});

test('untrusted hosts, ports, protocols, and malformed origins are rejected', () => {
  assert.equal(isAllowedFrontendOrigin('http://example.com:3000', configured, true), false);
  assert.equal(isAllowedFrontendOrigin('http://192.168.1.24:3001', configured, true), false);
  assert.equal(isAllowedFrontendOrigin('https://192.168.1.24:3000', configured, true), false);
  assert.equal(isAllowedFrontendOrigin('not a URL', configured, true), false);
});