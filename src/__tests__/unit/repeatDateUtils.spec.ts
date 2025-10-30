import { describe, it, expect } from 'vitest';

import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  getLastDayOfMonth,
  isLeapYear,
  isValidDateInMonth,
} from '../../utils/repeatDateUtils';

describe('RepeatDateUtils', () => {
  describe('isLeapYear', () => {
    it('isLeapYear - 윤년을 올바르게 판별한다', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2020)).toBe(true);
      expect(isLeapYear(2000)).toBe(true);
    });

    it('isLeapYear - 평년을 올바르게 판별한다', () => {
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(2025)).toBe(false);
      expect(isLeapYear(1900)).toBe(false);
    });
  });

  describe('getLastDayOfMonth', () => {
    it('getLastDayOfMonth - 윤년 2월의 마지막 날은 29일이다', () => {
      expect(getLastDayOfMonth(2024, 2)).toBe(29);
    });

    it('getLastDayOfMonth - 평년 2월의 마지막 날은 28일이다', () => {
      expect(getLastDayOfMonth(2023, 2)).toBe(28);
      expect(getLastDayOfMonth(2025, 2)).toBe(28);
    });

    it('getLastDayOfMonth - 31일까지 있는 월을 올바르게 반환한다', () => {
      expect(getLastDayOfMonth(2024, 1)).toBe(31);
      expect(getLastDayOfMonth(2024, 3)).toBe(31);
      expect(getLastDayOfMonth(2024, 5)).toBe(31);
      expect(getLastDayOfMonth(2024, 7)).toBe(31);
      expect(getLastDayOfMonth(2024, 8)).toBe(31);
      expect(getLastDayOfMonth(2024, 10)).toBe(31);
      expect(getLastDayOfMonth(2024, 12)).toBe(31);
    });

    it('getLastDayOfMonth - 30일까지 있는 월을 올바르게 반환한다', () => {
      expect(getLastDayOfMonth(2024, 4)).toBe(30);
      expect(getLastDayOfMonth(2024, 6)).toBe(30);
      expect(getLastDayOfMonth(2024, 9)).toBe(30);
      expect(getLastDayOfMonth(2024, 11)).toBe(30);
    });
  });

  describe('isValidDateInMonth', () => {
    it('isValidDateInMonth - 유효한 날짜를 올바르게 판별한다', () => {
      expect(isValidDateInMonth(2024, 2, 29)).toBe(true);
      expect(isValidDateInMonth(2024, 1, 31)).toBe(true);
      expect(isValidDateInMonth(2024, 4, 30)).toBe(true);
    });

    it('isValidDateInMonth - 무효한 날짜를 올바르게 판별한다', () => {
      expect(isValidDateInMonth(2023, 2, 29)).toBe(false);
      expect(isValidDateInMonth(2024, 2, 30)).toBe(false);
      expect(isValidDateInMonth(2024, 4, 31)).toBe(false);
      expect(isValidDateInMonth(2024, 11, 31)).toBe(false);
    });
  });

  describe('addDays', () => {
    it('addDays - ISO 날짜 문자열에 일 단위 증분을 적용한다', () => {
      expect(addDays('2024-01-01', 1)).toBe('2024-01-02');
      expect(addDays('2024-01-01', 3)).toBe('2024-01-04');
    });

    it('addDays - 월 경계를 넘어가는 증분을 처리한다', () => {
      expect(addDays('2024-01-31', 1)).toBe('2024-02-01');
      expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
      expect(addDays('2024-02-29', 1)).toBe('2024-03-01');
    });

    it('addDays - 음수 증분으로 날짜를 감소시킨다', () => {
      expect(addDays('2024-01-05', -2)).toBe('2024-01-03');
    });
  });

  describe('addWeeks', () => {
    it('addWeeks - ISO 날짜 문자열에 주 단위 증분을 적용한다', () => {
      expect(addWeeks('2024-01-01', 1)).toBe('2024-01-08');
      expect(addWeeks('2024-01-01', 2)).toBe('2024-01-15');
    });

    it('addWeeks - 월 경계를 넘어가는 증분을 처리한다', () => {
      expect(addWeeks('2024-01-25', 1)).toBe('2024-02-01');
    });
  });

  describe('addMonths', () => {
    it('addMonths - ISO 날짜 문자열에 월 단위 증분을 적용한다', () => {
      expect(addMonths('2024-01-15', 1)).toBe('2024-02-15');
      expect(addMonths('2024-01-15', 2)).toBe('2024-03-15');
    });

    it('addMonths - 연도 경계를 넘어가는 증분을 처리한다', () => {
      expect(addMonths('2024-11-15', 2)).toBe('2025-01-15');
    });

    it('addMonths - 대상 월에 날짜가 없으면 해당 월의 마지막 날로 조정한다', () => {
      expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
      expect(addMonths('2024-03-31', 1)).toBe('2024-04-30');
    });
  });

  describe('addYears', () => {
    it('addYears - ISO 날짜 문자열에 연 단위 증분을 적용한다', () => {
      expect(addYears('2024-03-15', 1)).toBe('2025-03-15');
      expect(addYears('2024-03-15', 2)).toBe('2026-03-15');
    });

    it('addYears - 윤년 2월 29일에서 평년으로 증분 시 2월 28일로 조정한다', () => {
      expect(addYears('2024-02-29', 1)).toBe('2025-02-28');
    });
  });
});
