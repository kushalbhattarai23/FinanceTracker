import { format, parseISO, isValid } from "date-fns";

/**
 * Format a date string to a readable format
 * @param dateString ISO date string
 * @param formatStr date-fns format string
 * @returns Formatted date string or empty string if invalid
 */
export function formatDate(dateString: string, formatStr: string = "PPP"): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return "";
    return format(date, formatStr);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

/**
 * Format a date object to date-only ISO string (YYYY-MM-DD)
 * @param date Date object
 * @returns ISO date string
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Get current date as ISO date string
 * @returns Current date as YYYY-MM-DD
 */
export function getCurrentDateAsISOString(): string {
  return toISODateString(new Date());
}

/**
 * Check if a string is a valid date
 * @param dateString Date string to validate
 * @returns boolean indicating if the string is a valid date
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  return isValid(date);
}

/**
 * Gets the current day name (e.g., "Monday")
 * @returns Current day name
 */
export function getCurrentDayName(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Format a date as a time string (e.g., "2:30 PM")
 * @param date Date object or ISO string
 * @returns Formatted time string
 */
export function formatTimeString(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
