export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

export const getLastDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

export const isValidDateInMonth = (year: number, month: number, day: number): boolean => {
  const lastDay = getLastDayOfMonth(year, month);
  return day >= 1 && day <= lastDay;
};

export const addDays = (date: string, delta: number): string => {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d.toISOString().split('T')[0];
};

export const addWeeks = (date: string, delta: number): string => {
  return addDays(date, delta * 7);
};

export const addMonths = (date: string, delta: number): string => {
  const d = new Date(date);
  const originalDay = d.getDate();

  d.setMonth(d.getMonth() + delta);

  // If day changed (e.g., Jan 31 + 1 month = Feb 28/29), adjust to last day of target month
  if (d.getDate() !== originalDay) {
    d.setDate(0); // Go back to last day of previous month
  }

  return d.toISOString().split('T')[0];
};

export const addYears = (date: string, delta: number): string => {
  const d = new Date(date);
  const originalDay = d.getDate();
  const originalMonth = d.getMonth();

  d.setFullYear(d.getFullYear() + delta);

  // Handle Feb 29 -> Feb 28 for non-leap years
  if (d.getMonth() !== originalMonth || d.getDate() !== originalDay) {
    d.setDate(0); // Go back to last day of previous month
  }

  return d.toISOString().split('T')[0];
};
