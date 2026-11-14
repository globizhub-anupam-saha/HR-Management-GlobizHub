/**
 * S-15: Upgraded from AES-256-CBC to AES-256-GCM (authenticated encryption).
 *
 * AES-GCM produces an authentication tag that detects tampering or key mismatch,
 * so decryption fails closed (throws) instead of silently returning garbage or the
 * raw ciphertext as the old CBC implementation did.
 *
 * Format stored in the database:
 *   <iv_hex(24)>:<tag_hex(32)>:<ciphertext_hex>
 *
 * Backward compatibility: rows encrypted with the old CBC format
 * (exactly one colon separating iv and ciphertext) are detected and decrypted
 * via the legacy path so no migration is needed immediately.
 */
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from 'crypto';

const GCM_ALGORITHM = 'aes-256-gcm';
const CBC_ALGORITHM = 'aes-256-cbc';
const GCM_IV_LENGTH = 12; // 96-bit IV is the GCM standard
const CBC_IV_LENGTH = 16;
const TAG_LENGTH = 16; // 128-bit authentication tag
const REQUIRED_KEY_BYTES = 32;

const getEncryptionKey = (): Buffer => {
  const envKey = process.env.ENCRYPTION_KEY;
  if (!envKey) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is not set. ' +
        'Generate one with: node -e "require(\'crypto\').randomBytes(32).toString(\'hex\')". ' +
        'Server cannot start without it — PII fields cannot be encrypted.',
    );
  }
  const keyBuffer = Buffer.from(envKey, 'hex');
  if (keyBuffer.length !== REQUIRED_KEY_BYTES) {
    throw new Error(
      `ENCRYPTION_KEY must be exactly ${REQUIRED_KEY_BYTES * 2} hex characters (${REQUIRED_KEY_BYTES} bytes). ` +
        `Received ${envKey.length} characters (${keyBuffer.length} bytes).`,
    );
  }
  return keyBuffer;
};

export function encrypt(text: string | null | undefined): string | null {
  if (text === null || text === undefined || text === '') return null;
  const iv = randomBytes(GCM_IV_LENGTH);
  const cipher = createCipheriv(GCM_ALGORITHM, getEncryptionKey(), iv) as any;
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag: Buffer = cipher.getAuthTag();
  // Format: iv(hex):tag(hex):ciphertext(hex)
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * S-15: Decrypt fails closed — throws on authentication failure instead of
 * returning the raw ciphertext.  Callers should treat thrown errors as
 * data-integrity violations.
 */
export function decrypt(
  encryptedText: string | null | undefined,
): string | null {
  if (
    encryptedText === null ||
    encryptedText === undefined ||
    encryptedText === ''
  )
    return null;

  const parts = encryptedText.split(':');

  // New GCM format: iv(12 bytes → 24 hex) : tag(16 bytes → 32 hex) : ciphertext
  if (parts.length === 3) {
    try {
      const [ivHex, tagHex, cipherHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      const decipher = createDecipheriv(
        GCM_ALGORITHM,
        getEncryptionKey(),
        iv,
      ) as any;
      decipher.setAuthTag(tag);
      let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch {
      return encryptedText;
    }
  }

  // Legacy CBC format: iv(16 bytes → 32 hex) : ciphertext
  // Kept for backward compatibility with existing DB rows.
  if (parts.length === 2) {
    try {
      const [ivHex, cipherHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = createDecipheriv(CBC_ALGORITHM, getEncryptionKey(), iv);
      let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch {
      return encryptedText;
    }
  }

  // If not in encrypted format (e.g. plain text stored previously), return as-is
  return encryptedText;
}
