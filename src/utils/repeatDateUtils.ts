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

/**
 * 반복 일정의 최대 종료 날짜
 * PRD에서 정의: 2025-12-31까지만 생성 가능
 */
export const MAX_REPEAT_END_DATE = '2025-12-31';

/**
 * 반복 일정의 종료 날짜를 반환합니다.
 * - undefined/null/빈 문자열인 경우 기본값(2025-12-31) 반환
 * - 최대값(2025-12-31)을 초과하면 최대값으로 제한
 * - 그 외에는 입력값 그대로 반환
 *
 * @param endDate - 종료 날짜 (YYYY-MM-DD 형식 또는 undefined)
 * @returns 처리된 종료 날짜
 */
export function getRepeatEndDate(endDate: string | undefined): string {
  // undefined, null, 빈 문자열인 경우 기본값 반환
  if (!endDate || endDate === '') {
    return MAX_REPEAT_END_DATE;
  }

  // 최대값 초과 여부 확인
  const endDateObj = new Date(endDate);
  const maxDateObj = new Date(MAX_REPEAT_END_DATE);

  if (endDateObj.getTime() > maxDateObj.getTime()) {
    return MAX_REPEAT_END_DATE;
  }

  // 유효한 날짜면 그대로 반환
  return endDate;
}
