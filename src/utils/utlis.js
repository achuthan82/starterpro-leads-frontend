export function convertDays(days) {
  // If days are less than 28 → return in weeks
  if (days < 28) {
    const weeks = Math.floor(days / 7);
    return `${weeks}+ week${weeks > 1 ? 's' : ''}`;
  }

  // 28 days and more → return in months
  const months = Math.floor(days / 28); 
  return `${months}+ month${months > 1 ? 's' : ''}`;
}
