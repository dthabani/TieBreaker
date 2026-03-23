/**
 * Security utilities for Master Password hashing and verification.
 *
 * Hashing strategy:
 *   - NEW format: PBKDF2-SHA256, 100,000 iterations, 32-byte output.
 *     Stored as: `pbkdf2$<base64url-salt>$<base64url-hash>`
 *   - LEGACY format: bare SHA-256 hex string (64 hex chars, no $ separator).
 *
 * During verification, the legacy format is detected automatically.
 * If a user authenticates successfully with a legacy hash, the caller
 * receives { verified: true, needsUpgrade: true } and should immediately
 * re-hash using hashPassword() and persist the new hash.
 */

const ITERATIONS = 100_000;
const HASH_BYTES = 32; // 256 bits
const ALGORITHM = 'SHA-256';

// Helpers 

function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

function isLegacyHash(hash: string): boolean {
  // Legacy hashes are plain 64-character hex strings with no '$' separator.
  return /^[0-9a-f]{64}$/.test(hash);
}

// Legacy SHA-256 (kept only for migration verification)

async function sha256Hex(input: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// PBKDF2

/**
 * Hash a password with PBKDF2 using a fresh random salt.
 * Returns a self-contained string: `pbkdf2$<salt>$<hash>` (all base64).
 */
export async function hashPassword(password: string): Promise<string> {
  const saltArr = crypto.getRandomValues(new Uint8Array(16));
  const salt = saltArr.buffer as ArrayBuffer;

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: ALGORITHM, salt, iterations: ITERATIONS },
    keyMaterial,
    HASH_BYTES * 8,
  );

  return `pbkdf2$${bufferToBase64(salt)}$${bufferToBase64(derived)}`;
}

// Verification

export interface VerifyResult {
  verified: boolean;
  // True when the stored hash is the old SHA-256 format and should be upgraded.
  needsUpgrade: boolean;
}

/**
 * Verify a plain-text password against a stored hash.
 *
 * Handles both the new PBKDF2 format and the legacy SHA-256 format.
 * When a legacy hash matches, `needsUpgrade` is set to true so the caller
 * can transparently re-hash and persist the new hash without a forced reset.
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<VerifyResult> {
  // Legacy path
  if (isLegacyHash(storedHash)) {
    const legacyHash = await sha256Hex(password);
    return {
      verified: legacyHash === storedHash,
      needsUpgrade: legacyHash === storedHash,
    };
  }

  // PBKDF2 path
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'pbkdf2') {
    return { verified: false, needsUpgrade: false };
  }

  const salt = base64ToBuffer(parts[1]).buffer as ArrayBuffer;
  const expectedHash = base64ToBuffer(parts[2]);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: ALGORITHM, salt, iterations: ITERATIONS },
    keyMaterial,
    HASH_BYTES * 8,
  );

  // Constant-time comparison to prevent timing attacks.
  const derivedArr = new Uint8Array(derived);
  let diff = derivedArr.length ^ expectedHash.length;
  for (let i = 0; i < Math.min(derivedArr.length, expectedHash.length); i++) {
    diff |= derivedArr[i] ^ expectedHash[i];
  }

  return { verified: diff === 0, needsUpgrade: false };
}
