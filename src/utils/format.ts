/**
 * Format utilities for consistent data display
 */

/**
 * Format duration in seconds to readable string
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "2m 30s", "1h 5m")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Format duration for display in timer format
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "02:30", "1:05:23")
 */
export function formatTimerDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format date to relative time (e.g., "2 hours ago", "yesterday")
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;

  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? '' : 's'} ago`;

  return then.toLocaleDateString();
}

/**
 * Format score to display format
 * @param score - Score value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted score string
 */
export function formatScore(score: number, decimals: number = 1): string {
  const validScore = typeof score === 'number' && !isNaN(score) ? score : 0;
  return validScore.toFixed(decimals);
}

/**
 * Format percentage
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  const validValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  return `${validValue.toFixed(decimals)}%`;
}

/**
 * Format large numbers with K/M/B suffixes
 * @param num - Number to format
 * @returns Formatted number string (e.g., "1.2K", "3.5M")
 */
export function formatNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
}

/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter of string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format date to local date string
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  return dateObj.toLocaleDateString(undefined, options || {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time to local time string
 * @param date - Date to format
 * @returns Formatted time string
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid time';
  }

  return dateObj.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}
