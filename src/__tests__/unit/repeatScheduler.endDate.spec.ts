/**
 * Unit Test: repeatScheduler - generateRecurringEventsUntilEndDate
 *
 * 종료 날짜까지 반복 일정을 생성하는 로직을 테스트합니다.
 */

import { describe, expect, it } from 'vitest';

import type { EventForm } from '../../types';
// TODO: Stage 7에서 구현 예정
import { generateRecurringEventsUntilEndDate } from '../../utils/repeatScheduler';

describe('repeatScheduler', () => {
  describe('generateRecurringEventsUntilEndDate', () => {
    const createBaseEvent = (overrides?: Partial<EventForm>): EventForm => ({
      title: '테스트 이벤트',
      date: '2025-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: 'Unit test',
      location: 'Test',
      category: '테스트',
      repeat: {
        type: 'daily',
        interval: 1,
      },
      notificationTime: 10,
      ...overrides,
    });

    it('TC-R-1: 매일 반복, 5일간', () => {
      // Arrange
      const baseEvent = createBaseEvent();
      const endDate = '2025-10-05';

      // Act
      const events = generateRecurringEventsUntilEndDate(baseEvent, endDate);

      // Assert
      expect(events).toHaveLength(5);
      expect(events[0].date).toBe('2025-10-01');
      expect(events[4].date).toBe('2025-10-05');
    });

    it('TC-R-2: 매일 반복, 10일간', () => {
      // Arrange
      const baseEvent = createBaseEvent();
      const endDate = '2025-10-10';

      // Act
      const events = generateRecurringEventsUntilEndDate(baseEvent, endDate);

      // Assert
      expect(events).toHaveLength(10);
      expect(events[9].date).toBe('2025-10-10');

      // 10/11은 생성되지 않아야 함
      const hasEvent1011 = events.some((event) => event.date === '2025-10-11');
      expect(hasEvent1011).toBe(false);
    });

    it('TC-R-3: 매주 반복, 1개월', () => {
      // Arrange
      const baseEvent = createBaseEvent({
        repeat: { type: 'weekly', interval: 1 },
      });
      const endDate = '2025-10-31';

      // Act
      const events = generateRecurringEventsUntilEndDate(baseEvent, endDate);

      // Assert
      expect(events).toHaveLength(5);
      expect(events[0].date).toBe('2025-10-01');
      expect(events[1].date).toBe('2025-10-08');
      expect(events[2].date).toBe('2025-10-15');
      expect(events[3].date).toBe('2025-10-22');
      expect(events[4].date).toBe('2025-10-29');
    });

    it('TC-R-4: 매월 반복, 3개월', () => {
      // Arrange
      const baseEvent = createBaseEvent({
        repeat: { type: 'monthly', interval: 1 },
      });
      const endDate = '2025-12-31';

      // Act
      const events = generateRecurringEventsUntilEndDate(baseEvent, endDate);

      // Assert
      expect(events).toHaveLength(3);
      expect(events[0].date).toBe('2025-10-01');
      expect(events[1].date).toBe('2025-11-01');
      expect(events[2].date).toBe('2025-12-01');
    });

    it('TC-R-5: 연간 반복, 같은 해', () => {
      // Arrange
      const baseEvent = createBaseEvent({
        repeat: { type: 'yearly', interval: 1 },
      });
      const endDate = '2025-12-31';

      // Act
      const events = generateRecurringEventsUntilEndDate(baseEvent, endDate);

      // Assert
      expect(events).toHaveLength(1);
      expect(events[0].date).toBe('2025-10-01');
    });

    it('TC-R-6: 종료 날짜 = 시작 날짜', () => {
      // Arrange
      const baseEvent = createBaseEvent({
        date: '2025-10-15',
      });
      const endDate = '2025-10-15';

      // Act
      const events = generateRecurringEventsUntilEndDate(baseEvent, endDate);

      // Assert
      expect(events).toHaveLength(1);
      expect(events[0].date).toBe('2025-10-15');
    });

    it('TC-R-7: 종료 날짜가 첫 반복 전 (경계값)', () => {
      // Arrange
      const baseEvent = createBaseEvent({
        repeat: { type: 'weekly', interval: 1 },
      });
      const endDate = '2025-10-02';

      // Act
      const events = generateRecurringEventsUntilEndDate(baseEvent, endDate);

      // Assert
      expect(events).toHaveLength(1);
      expect(events[0].date).toBe('2025-10-01');

      // 다음 주(10/8)는 생성되지 않아야 함
      const hasEvent1008 = events.some((event) => event.date === '2025-10-08');
      expect(hasEvent1008).toBe(false);
    });
  });
});
