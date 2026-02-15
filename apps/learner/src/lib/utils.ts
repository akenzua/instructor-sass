/**
 * Format a number as GBP currency.
 * Uses absolute value — prefix with "-" separately for debts.
 */
export const formatCurrency = (amount: number, currency = "GBP") => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(Math.abs(amount));
};

/**
 * Check if a lesson starts within the next 2 hours.
 */
export const isLessonUrgent = (startTime: Date): boolean => {
  const hoursUntil = (startTime.getTime() - Date.now()) / (1000 * 60 * 60);
  return hoursUntil <= 2 && hoursUntil > 0;
};

/**
 * Check if a lesson is scheduled for today.
 */
export const isLessonToday = (startTime: Date): boolean => {
  return startTime.toDateString() === new Date().toDateString();
};

/**
 * Normalize lesson type strings for display.
 * Handles both underscore and hyphen separators.
 */
export const formatLessonType = (type: string): string => {
  return type.replace(/[-_]/g, " ");
};
