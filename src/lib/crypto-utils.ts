/**
 * Crypto utilities compatible with Edge Runtime
 * Uses Web Crypto API instead of Node.js crypto module
 */

/**
 * Generate random bytes using Web Crypto API
 */
export async function randomBytes(length: number): Promise<Uint8Array> {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

/**
 * Convert Uint8Array to hex string
 */
export function arrayToHex(array: Uint8Array): string {
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate random hex string
 */
export async function randomHex(length: number): Promise<string> {
  const bytes = await randomBytes(length);
  return arrayToHex(bytes);
}

/**
 * Create SHA-256 hash using Web Crypto API
 */
export async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = new Uint8Array(hashBuffer);
  return arrayToHex(hashArray);
}

/**
 * Generate secure random token
 */
export async function generateSecureToken(): Promise<string> {
  return await randomHex(32);
}

/**
 * Hash token for storage
 */
export async function hashToken(token: string): Promise<string> {
  return await sha256(token);
}