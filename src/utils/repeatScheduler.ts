import type { EventForm } from '../types';
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
