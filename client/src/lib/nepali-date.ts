// A simplified implementation for Nepali date representation
// In a real app, you'd use a dedicated Nepali date library

// The current year is 2080 in the Nepali calendar (2023-2024 in Gregorian)
// For simplicity, we'll use a fixed date format to avoid conversion issues

// Nepali month names
const nepaliMonthNames = [
  "Baishakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

// Default to 2080 (current Nepali year)
export function getCurrentNepaliDate(): { year: number; month: number; day: number } {
  // Get the current date
  const now = new Date();
  
  // For simplicity, we'll map Gregorian months to Nepali months approximately
  // This is not accurate but works for our demo
  const year = 2080;
  const month = now.getMonth(); // Use Gregorian month as an approximation
  const day = now.getDate();
  
  return { year, month, day };
}

// Simplified conversion function - not accurate but works for demo
export function convertToNepaliDate(englishDate: Date): { year: number; month: number; day: number } {
  // For simplicity in the demo, return 2080 with the same month and day
  return {
    year: 2080,
    month: englishDate.getMonth(),
    day: englishDate.getDate()
  };
}

export function formatNepaliDate(date: { year: number; month: number; day: number }): string {
  return `${date.year}-${String(date.month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}

export function nepaliDateToString(date: { year: number; month: number; day: number }): string {
  return `${date.year} ${nepaliMonthNames[date.month]} ${date.day}`;
}