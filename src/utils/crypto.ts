import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Derives a 32-byte Buffer key from the provided encryption key string
 */
export function deriveKey(keyString: string): Buffer {
  if (!keyString) {
    throw new Error('NEXUM_ENCRYPTION_KEY is required for encryption/decryption');
  }
  // If already 64 hex characters (32 bytes hex), parse hex
  if (/^[0-9a-fA-F]{64}$/.test(keyString)) {
    return Buffer.from(keyString, 'hex');
  }
  // Otherwise derive with sha256 to ensure exact 32-byte key
  return crypto.createHash('sha256').update(keyString).digest();
}

/**
 * Encrypts plain text using AES-256-GCM with random 16-byte IV
 * Returns base64 string formatted as: iv:tag:ciphertext
 */
export function encryptCredential(plainText: string, keyString: string): string {
  if (!plainText) return '';
  const key = deriveKey(keyString);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM encrypted string formatted as iv:tag:ciphertext
 */
export function decryptCredential(encryptedData: string, keyString: string): string {
  if (!encryptedData) return '';
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format (expected iv:tag:ciphertext)');
  }

  const [ivHex, tagHex, cipherHex] = parts;
  const key = deriveKey(keyString);
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
