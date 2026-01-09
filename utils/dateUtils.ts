
/**
 * Formats a date string to Korea Standard Time (KST) format.
 */
export const formatToKST = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
};

/**
 * Returns current ISO string for tracking revision updates.
 */
export const getCurrentISO = (): string => new Date().toISOString();
