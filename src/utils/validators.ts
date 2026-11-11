/**
 * Validates a Brazilian CPF using standard modulo 11 check digits
 */
export function validateCPF(cpf: string): boolean {
  if (!cpf) return false;
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;

  // Disallow identical digits (e.g., 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Calculate 1st check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(9), 10)) return false;

  // Calculate 2nd check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(10), 10)) return false;

  return true;
}

/**
 * Masks CPF as 000.000.000-00
 */
export function maskCPF(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 11);
  return clean
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

/**
 * Masks CEP as 00000-000
 */
export function maskCEP(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 8);
  return clean.replace(/^(\d{5})(\d)/, '$1-$2');
}

/**
 * Masks Brazilian Phone as (00) 00000-0000 or (00) 0000-0000
 */
export function maskPhone(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 11);
  if (clean.length > 10) {
    return clean.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return clean.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
}

/**
 * Formats BRL currency e.g. R$ 149,90
 */
export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Normalizes text to URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .replace(/[º°]/g, 'o')
    .replace(/[ª]/g, 'a')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Sanitizes customer name for Nexum Pay (no accents, symbols, or numbers)
 */
export function sanitizeNameForNexum(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim() || 'Cliente';
}
