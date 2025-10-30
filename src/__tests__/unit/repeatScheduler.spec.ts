import { describe, it, expect } from 'vitest';

import type { EventForm } from '../../types';
import {
  generateDailyOccurrences,
  generateMonthlyOccurrences,
  generateSingleEvent,
  generateWeeklyOccurrences,
  generateYearlyOccurrences,
  type RecurringGenerationParams,
} from '../../utils/repeatScheduler';

const createBaseEvent = (overrides: Partial<EventForm> = {}): EventForm => ({
  title: '테스트 일정',
  date: '2024-01-01',
  startTime: '09:00',
  endTime: '10:00',
  description: '',
  location: '',
  category: '업무',
  repeat: {
    type: 'none',
    interval: 1,
    ...overrides.repeat,
  },
  notificationTime: 10,
  ...overrides,
});

const toParams = (baseEvent: EventForm, occurrenceCount: number): RecurringGenerationParams => ({
  baseEvent,
  occurrenceCount,
});

describe('RepeatScheduler', () => {
  describe('generateDailyOccurrences', () => {
    it('generateDailyOccurrences - 요청된 횟수만큼 연속된 날짜를 생성한다', () => {
      const baseEvent = createBaseEvent({
        date: '2024-01-01',
        repeat: { type: 'daily', interval: 1 },
      });

      const result = generateDailyOccurrences(toParams(baseEvent, 3));

      expect(result).toHaveLength(3);
      expect(result.map((e) => e.date)).toEqual(['2024-01-01', '2024-01-02', '2024-01-03']);
    });

    it('generateDailyOccurrences - 모든 이벤트 속성을 유지한다', () => {
      const baseEvent = createBaseEvent({
        date: '2024-01-01',
        title: '매일 회의',
        repeat: { type: 'daily', interval: 1 },
      });

      const result = generateDailyOccurrences(toParams(baseEvent, 2));

      expect(result[0].title).toBe('매일 회의');
      expect(result[1].title).toBe('매일 회의');
    });
  });

  describe('generateWeeklyOccurrences', () => {
    it('generateWeeklyOccurrences - 동일한 요일로 주간 반복 일정을 생성한다', () => {
      const baseEvent = createBaseEvent({
        date: '2024-01-03',
        repeat: { type: 'weekly', interval: 1 },
      });

      const result = generateWeeklyOccurrences(toParams(baseEvent, 4));

      expect(result).toHaveLength(4);
      expect(result.map((e) => e.date)).toEqual([
        '2024-01-03',
        '2024-01-10',
        '2024-01-17',
        '2024-01-24',
      ]);
    });
  });

  describe('generateMonthlyOccurrences', () => {
    it('generateMonthlyOccurrences - 월 반복 시 대상 일이 없는 월을 건너뛴다', () => {
      const baseEvent = createBaseEvent({
        date: '2024-01-31',
        repeat: { type: 'monthly', interval: 1 },
      });

      const result = generateMonthlyOccurrences(toParams(baseEvent, 6));
      const dates = result.map((e) => e.date);

      expect(dates).toContain('2024-01-31');
      expect(dates).not.toContain('2024-02-31');
      expect(dates).toContain('2024-03-31');
      expect(dates).not.toContain('2024-04-31');
      expect(dates).toContain('2024-05-31');
      expect(dates).not.toContain('2024-06-31');
    });

    it('generateMonthlyOccurrences - 31일이 있는 월만 순차적으로 포함한다', () => {
      const baseEvent = createBaseEvent({
        date: '2024-01-31',
        repeat: { type: 'monthly', interval: 1 },
      });

      const result = generateMonthlyOccurrences(toParams(baseEvent, 4));

      expect(result.map((e) => e.date)).toEqual([
        '2024-01-31',
        '2024-03-31',
        '2024-05-31',
        '2024-07-31',
      ]);
    });
  });

  describe('generateYearlyOccurrences', () => {
    it('generateYearlyOccurrences - 윤년 2월 29일 예외를 처리하며 연간 반복을 생성한다', () => {
      const baseEvent = createBaseEvent({
        date: '2024-02-29',
        repeat: { type: 'yearly', interval: 1 },
      });

      const result = generateYearlyOccurrences(toParams(baseEvent, 3));

      expect(result.map((e) => e.date)).toEqual(['2024-02-29', '2028-02-29', '2032-02-29']);
    });

    it('generateYearlyOccurrences - 평년에는 2월 29일을 건너뛴다', () => {
      const baseEvent = createBaseEvent({
        date: '2024-02-29',
        repeat: { type: 'yearly', interval: 1 },
      });

      const result = generateYearlyOccurrences(toParams(baseEvent, 5));
      const dates = result.map((e) => e.date);

      expect(dates).not.toContain('2025-02-29');
      expect(dates).not.toContain('2026-02-29');
      expect(dates).not.toContain('2027-02-29');
    });
  });

  describe('generateSingleEvent', () => {
    it('generateSingleEvent - 반복 미선택 시 단일 일정만 반환한다', () => {
      const baseEvent = createBaseEvent({
        date: '2024-01-15',
      });

      const result = generateSingleEvent(baseEvent);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(baseEvent);
    });
  });
});
