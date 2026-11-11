import test from 'node:test';
import assert from 'node:assert/strict';
import { encryptCredential, decryptCredential, deriveKey } from './crypto';

test('crypto key derivation produces 32-byte key', () => {
  const key = deriveKey('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');
  assert.equal(key.length, 32);

  const fallbackKey = deriveKey('short-password');
  assert.equal(fallbackKey.length, 32);
});

test('encryptCredential and decryptCredential successfully roundtrip', () => {
  const secretKey = 'my-super-secret-nexum-encryption-key-for-test';
  const plainCredential = 'nexum_cred_test_123456_secure';

  const encrypted = encryptCredential(plainCredential, secretKey);
  assert.notEqual(encrypted, plainCredential);
  assert.ok(encrypted.includes(':'));

  const decrypted = decryptCredential(encrypted, secretKey);
  assert.equal(decrypted, plainCredential);
});

test('decryptCredential fails when tampered or wrong key', () => {
  const key1 = 'key-number-one-test-key-32-bytes-long!';
  const key2 = 'key-number-two-test-key-32-bytes-long!';
  const plain = 'secret-data';

  const encrypted = encryptCredential(plain, key1);
  assert.throws(() => {
    decryptCredential(encrypted, key2);
  });
});
