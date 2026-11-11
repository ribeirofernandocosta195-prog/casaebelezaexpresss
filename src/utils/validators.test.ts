import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCPF,
  maskCPF,
  maskCEP,
  maskPhone,
  formatCurrencyBRL,
  slugify,
  sanitizeNameForNexum,
} from './validators';

test('validateCPF recognizes valid and invalid Brazilian CPFs', () => {
  // Common valid test CPFs
  assert.equal(validateCPF('52998224725'), true);
  assert.equal(validateCPF('529.982.247-25'), true);

  // Invalid: repeated digits
  assert.equal(validateCPF('11111111111'), false);
  assert.equal(validateCPF('00000000000'), false);

  // Invalid check digits
  assert.equal(validateCPF('12345678900'), false);
  assert.equal(validateCPF('123'), false);
});

test('masking functions format correctly', () => {
  assert.equal(maskCPF('52998224725'), '529.982.247-25');
  assert.equal(maskCEP('01310100'), '01310-100');
  assert.equal(maskPhone('11987654321'), '(11) 98765-4321');
});

test('slugify normalizes accented Brazilian Portuguese strings', () => {
  assert.equal(slugify('Batom Hidratante Rosa Queimado Nº 04'), 'batom-hidratante-rosa-queimado-no-04');
  assert.equal(slugify('Difusor de Aromas & Decoração Floral'), 'difusor-de-aromas-decoracao-floral');
});

test('sanitizeNameForNexum removes accents and non-letters', () => {
  assert.equal(sanitizeNameForNexum('João de Sá Müller 123!'), 'Joao de Sa Muller');
});

test('formatCurrencyBRL formats monetary amounts properly', () => {
  const formatted = formatCurrencyBRL(129.9);
  assert.ok(formatted.includes('129,90') || formatted.includes('129.90'));
});
