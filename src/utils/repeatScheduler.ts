import type { EventForm, Event } from '../types';
import { addDays, addWeeks, isValidDateInMonth } from './repeatDateUtils';

export interface RecurringGenerationParams {
  baseEvent: EventForm;
  occurrenceCount: number;
}

export const generateDailyOccurrences = (params: RecurringGenerationParams): EventForm[] => {
  const { baseEvent, occurrenceCount } = params;
  const result: EventForm[] = [];

  for (let i = 0; i < occurrenceCount; i++) {
    result.push({
      ...baseEvent,
      date: addDays(baseEvent.date, i),
    });
  }

  return result;
};

export const generateWeeklyOccurrences = (params: RecurringGenerationParams): EventForm[] => {
  const { baseEvent, occurrenceCount } = params;
  const result: EventForm[] = [];

  for (let i = 0; i < occurrenceCount; i++) {
    result.push({
      ...baseEvent,
      date: addWeeks(baseEvent.date, i),
    });
  }

  return result;
};

export const generateMonthlyOccurrences = (params: RecurringGenerationParams): EventForm[] => {
  const { baseEvent, occurrenceCount } = params;
  const result: EventForm[] = [];

  const [year, month, day] = baseEvent.date.split('-').map(Number);
  let currentYear = year;
  let currentMonth = month;

  while (result.length < occurrenceCount) {
    if (isValidDateInMonth(currentYear, currentMonth, day)) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(
        day
      ).padStart(2, '0')}`;
      result.push({
        ...baseEvent,
        date: dateStr,
      });
    }

    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  return result;
};

export const generateYearlyOccurrences = (params: RecurringGenerationParams): EventForm[] => {
  const { baseEvent, occurrenceCount } = params;
  const result: EventForm[] = [];

  const [year, month, day] = baseEvent.date.split('-').map(Number);
  let currentYear = year;

  while (result.length < occurrenceCount) {
    if (isValidDateInMonth(currentYear, month, day)) {
      const dateStr = `${currentYear}-${String(month).padStart(2, '0')}-${String(day).padStart(
        2,
        '0'
      )}`;
      result.push({
        ...baseEvent,
        date: dateStr,
      });
    }

    currentYear++;
  }

  return result;
};

export const generateSingleEvent = (baseEvent: EventForm): EventForm[] => {
  return [baseEvent];
};

/**
 * Generate recurring events based on repeat type
 */
export const generateRecurringEvents = (baseEvent: EventForm | Event): EventForm[] => {
  const repeatType = baseEvent.repeat.type;

  if (repeatType === 'none') {
    return generateSingleEvent(baseEvent as EventForm);
  }

  const params: RecurringGenerationParams = {
    baseEvent: baseEvent as EventForm,
    occurrenceCount: getDefaultCount(repeatType),
  };

  switch (repeatType) {
    case 'daily':
      return generateDailyOccurrences(params);
    case 'weekly':
      return generateWeeklyOccurrences(params);
    case 'monthly':
      return generateMonthlyOccurrences(params);
    case 'yearly':
      return generateYearlyOccurrences(params);
    default:
      return generateSingleEvent(baseEvent as EventForm);
  }
};

/**
 * Get default count for each repeat type
 */
function getDefaultCount(repeatType: string): number {
  switch (repeatType) {
    case 'daily':
      return 7; // 7 days
    case 'weekly':
      return 4; // 4 weeks
    case 'monthly':
      return 12; // 12 months (1 year)
    case 'yearly':
      return 5; // 5 years
    default:
      return 1;
  }
}

/**
 * 종료 날짜까지 반복 일정을 생성합니다.
 *
 * @param baseEvent - 기본 이벤트 정보
 * @param endDate - 종료 날짜 (YYYY-MM-DD 형식)
 * @returns 생성된 이벤트 배열
 */
export function generateRecurringEventsUntilEndDate(
  baseEvent: Event | EventForm,
  endDate: string
): Event[] {
  const repeatType = baseEvent.repeat.type;

  // 반복 안함인 경우 시작 이벤트 1개만 반환
  if (repeatType === 'none') {
    return generateSingleEvent(baseEvent as EventForm) as Event[];
  }

  const endDateObj = new Date(endDate);
  const result: Event[] = [];

  // 충분히 많은 수의 이벤트를 생성한 후 endDate까지 필터링
  // 최대 365일치 생성 (daily 기준)
  const params: RecurringGenerationParams = {
    baseEvent: baseEvent as EventForm,
    occurrenceCount: 365, // 충분히 큰 수
  };

  let candidates: EventForm[] = [];

  switch (repeatType) {
    case 'daily':
      candidates = generateDailyOccurrences(params);
      break;
    case 'weekly':
      candidates = generateWeeklyOccurrences({ ...params, occurrenceCount: 52 });
      break;
    case 'monthly':
      candidates = generateMonthlyOccurrences({ ...params, occurrenceCount: 12 });
      break;
    case 'yearly':
      candidates = generateYearlyOccurrences({ ...params, occurrenceCount: 5 });
      break;
    default:
      return generateSingleEvent(baseEvent as EventForm) as Event[];
  }

  // endDate 이하인 이벤트만 필터링
  for (const candidate of candidates) {
    const candidateDateObj = new Date(candidate.date);
    if (candidateDateObj.getTime() <= endDateObj.getTime()) {
      result.push(candidate as Event);
    } else {
      break; // 정렬되어 있으므로 이후는 모두 제외
    }
  }

  return result;
}
