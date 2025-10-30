/**
 * Unit Test: repeatGroupUtils
 *
 * 반복 일정 그룹 식별 로직을 테스트합니다.
 */

import { describe, expect, it } from 'vitest';

import type { Event } from '../../types';
// TODO: Stage 7에서 구현 예정
import { findRepeatGroup } from '../../utils/repeatGroupUtils';

describe('repeatGroupUtils', () => {
  const createMockEvent = (overrides?: Partial<Event>): Event => ({
    id: 'event-1',
    title: '팀 미팅',
    date: '2025-10-06',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
    ...overrides,
  });

  describe('findRepeatGroup', () => {
    it('TC-F-1: 같은 그룹의 모든 이벤트를 반환한다', () => {
      // Arrange
      const mockRepeatingGroup: Event[] = [
        createMockEvent({ id: 'repeat-1', date: '2025-10-06' }),
        createMockEvent({ id: 'repeat-2', date: '2025-10-13' }),
        createMockEvent({ id: 'repeat-3', date: '2025-10-20' }),
      ];
      const targetEvent = mockRepeatingGroup[0];

      // Act
      const result = findRepeatGroup(mockRepeatingGroup, targetEvent);

      // Assert
      expect(result).toHaveLength(3);
      expect(result).toEqual(expect.arrayContaining(mockRepeatingGroup));
    });

    it('TC-F-2: 유일한 반복 일정은 자기 자신만 반환한다', () => {
      // Arrange
      const singleEvent = createMockEvent({ id: 'single-1' });
      const events = [singleEvent];

      // Act
      const result = findRepeatGroup(events, singleEvent);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(singleEvent);
    });

    it('TC-F-3: 제목이 같지만 시간이 다른 이벤트는 제외한다', () => {
      // Arrange
      const event1 = createMockEvent({ id: 'event-1', startTime: '10:00' });
      const event2 = createMockEvent({ id: 'event-2', startTime: '11:00' });
      const events = [event1, event2];

      // Act
      const result = findRepeatGroup(events, event1);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(event1);
    });

    it('TC-F-4: 제목과 시간이 같지만 반복 유형이 다른 이벤트는 제외한다', () => {
      // Arrange
      const event1 = createMockEvent({
        id: 'event-1',
        repeat: { type: 'weekly', interval: 1 },
      });
      const event2 = createMockEvent({
        id: 'event-2',
        repeat: { type: 'daily', interval: 1 },
      });
      const events = [event1, event2];

      // Act
      const result = findRepeatGroup(events, event1);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(event1);
    });

    it('TC-F-5: 일반 일정(repeat.type="none")은 자기 자신만 반환한다', () => {
      // Arrange
      const normalEvent1 = createMockEvent({
        id: 'normal-1',
        repeat: { type: 'none', interval: 1 },
      });
      const normalEvent2 = createMockEvent({
        id: 'normal-2',
        repeat: { type: 'none', interval: 1 },
      });
      const events = [normalEvent1, normalEvent2];

      // Act
      const result = findRepeatGroup(events, normalEvent1);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(normalEvent1);
    });

    it('TC-F-6: 빈 배열 입력 시 빈 배열을 반환한다', () => {
      // Arrange
      const events: Event[] = [];
      const targetEvent = createMockEvent();

      // Act
      const result = findRepeatGroup(events, targetEvent);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('TC-F-7: 존재하지 않는 이벤트는 빈 배열을 반환한다', () => {
      // Arrange
      const event1 = createMockEvent({ id: 'event-1' });
      const event2 = createMockEvent({ id: 'event-2' });
      const event3 = createMockEvent({ id: 'event-3', title: '다른 회의' });
      const events = [event1, event2];

      // Act
      const result = findRepeatGroup(events, event3);

      // Assert
      expect(result).toHaveLength(0);
    });
  });
});
