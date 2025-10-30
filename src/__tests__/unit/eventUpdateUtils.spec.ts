/**
 * Unit Test: eventUpdateUtils
 *
 * 이벤트 수정 적용 로직을 테스트합니다.
 */

import { describe, expect, it } from 'vitest';

import type { Event } from '../../types';
// TODO: Stage 7에서 구현 예정
import { applyEventUpdate } from '../../utils/eventUpdateUtils';

describe('eventUpdateUtils', () => {
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

  describe('applyEventUpdate', () => {
    it('TC-A-1: mode="single", 제목 수정 시 repeat.type="none"으로 변경된다', () => {
      // Arrange
      const event = createMockEvent({ repeat: { type: 'weekly', interval: 1 } });
      const updates = { title: '개인 미팅' };

      // Act
      const result = applyEventUpdate(event, updates, 'single');

      // Assert
      expect(result.title).toBe('개인 미팅');
      expect(result.repeat.type).toBe('none');
    });

    it('TC-A-2: mode="all", 제목 수정 시 repeat.type이 유지된다', () => {
      // Arrange
      const event = createMockEvent({ repeat: { type: 'weekly', interval: 1 } });
      const updates = { title: '헬스' };

      // Act
      const result = applyEventUpdate(event, updates, 'all');

      // Assert
      expect(result.title).toBe('헬스');
      expect(result.repeat.type).toBe('weekly');
    });

    it('TC-A-3: mode="single", 여러 필드 수정 시 repeat.type="none"으로 변경된다', () => {
      // Arrange
      const event = createMockEvent({
        title: '회의',
        startTime: '10:00',
        repeat: { type: 'daily', interval: 1 },
      });
      const updates = { title: '미팅', startTime: '11:00' };

      // Act
      const result = applyEventUpdate(event, updates, 'single');

      // Assert
      expect(result.title).toBe('미팅');
      expect(result.startTime).toBe('11:00');
      expect(result.repeat.type).toBe('none');
    });

    it('TC-A-4: mode="all", 시간 수정 시 repeat.type이 유지된다', () => {
      // Arrange
      const event = createMockEvent({
        startTime: '09:00',
        repeat: { type: 'monthly', interval: 1 },
      });
      const updates = { startTime: '10:00' };

      // Act
      const result = applyEventUpdate(event, updates, 'all');

      // Assert
      expect(result.startTime).toBe('10:00');
      expect(result.repeat.type).toBe('monthly');
    });

    it('TC-A-5: 일반 일정(repeat.type="none")은 mode 무관하게 "none" 유지', () => {
      // Arrange
      const event = createMockEvent({
        title: '일반',
        repeat: { type: 'none', interval: 1 },
      });
      const updates = { title: '수정' };

      // Act (single 모드)
      const resultSingle = applyEventUpdate(event, updates, 'single');

      // Assert
      expect(resultSingle.title).toBe('수정');
      expect(resultSingle.repeat.type).toBe('none');

      // Act (all 모드)
      const resultAll = applyEventUpdate(event, updates, 'all');

      // Assert
      expect(resultAll.title).toBe('수정');
      expect(resultAll.repeat.type).toBe('none');
    });

    it('TC-A-6: updates가 빈 객체면 원본 이벤트 그대로 반환된다', () => {
      // Arrange
      const event = createMockEvent({
        title: '회의',
        repeat: { type: 'weekly', interval: 1 },
      });
      const updates = {};

      // Act
      const result = applyEventUpdate(event, updates, 'single');

      // Assert
      expect(result.title).toBe('회의');
      expect(result.repeat.type).toBe('weekly'); // 수정 없으므로 유지
    });

    it('TC-A-7: 수정되지 않은 필드는 원본 값을 유지한다', () => {
      // Arrange
      const event = createMockEvent({
        title: '회의',
        date: '2025-10-01',
        startTime: '10:00',
      });
      const updates = { title: '미팅' };

      // Act
      const result = applyEventUpdate(event, updates, 'all');

      // Assert
      expect(result.title).toBe('미팅');
      expect(result.date).toBe('2025-10-01');
      expect(result.startTime).toBe('10:00');
    });
  });
});
