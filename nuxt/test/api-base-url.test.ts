import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveApiBaseUrl } from '../utils/api-base-url';

test('desktop development keeps the local API URL', () => {
  assert.equal(
    resolveApiBaseUrl('http://localhost:3001', 'localhost'),
    'http://localhost:3001',
  );
});

test('phone access rewrites a loopback API hostname to the QR page hostname', () => {
  assert.equal(
    resolveApiBaseUrl('http://localhost:3001', '192.168.1.24'),
    'http://192.168.1.24:3001',
  );
});

test('an explicitly configured non-loopback API host is preserved', () => {
  assert.equal(
    resolveApiBaseUrl('https://api.example.test/v1/', '192.168.1.24'),
    'https://api.example.test/v1',
  );
});