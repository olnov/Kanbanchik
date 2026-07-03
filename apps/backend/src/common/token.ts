import { randomBytes } from 'crypto';

/** High-entropy, url-safe join token (not guessable / enumerable). */
export function generateToken(): string {
  return randomBytes(24).toString('base64url');
}
