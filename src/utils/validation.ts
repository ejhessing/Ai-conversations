/**
 * Validation utilities
 */

/**
 * Validate email format
 * @param email - Email to validate
 * @returns true if valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with isValid flag and error message
 */
export function validatePassword(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password must be less than 128 characters' };
  }

  return { isValid: true };
}

/**
 * Validate name format
 * @param name - Name to validate
 * @returns true if valid name
 */
export function isValidName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 50;
}

/**
 * Validate score value (0-10)
 * @param score - Score to validate
 * @returns Clamped score value
 */
export function validateScore(score: number): number {
  if (typeof score !== 'number' || isNaN(score)) return 0;
  return Math.max(0, Math.min(10, score));
}

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns true if valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize user input (remove potentially dangerous characters)
 * @param input - Input to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim();
}

/**
 * Validate duration is positive
 * @param seconds - Duration in seconds
 * @returns Valid duration (>= 0)
 */
export function validateDuration(seconds: number): number {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) return 0;
  return Math.floor(seconds);
}

/**
 * Check if array has valid data
 * @param arr - Array to check
 * @returns true if array exists and has items
 */
export function hasValidData<T>(arr: T[] | null | undefined): arr is T[] {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Validate UUID format
 * @param uuid - UUID to validate
 * @returns true if valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
