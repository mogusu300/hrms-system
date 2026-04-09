import { hash, compare } from 'bcryptjs';

/**
 * Hash a password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return hash(password, saltRounds);
}

/**
 * Compare a plain password with a hashed password
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

/**
 * Simple password verification (for plain text comparison if needed)
 */
export function verifyPasswordPlain(password: string, stored: string): boolean {
  return password === stored;
}
