/**
 * FEATURE2 단위 테스트: 반복 일정 판별 로직
 * 대상: isRepeatingEvent 함수
 *
 * 이 테스트는 이벤트가 반복 일정인지 일반 일정인지 판별하는
 * 순수 함수의 정확성을 검증합니다.
 */

import { describe, it, expect } from 'vitest';

import type { Event } from '../../types';
import { isRepeatingEvent } from '../../utils/eventTypeChecker';

describe('isRepeatingEvent', () => {
  // ----- 정상 케이스: 반복 유형 판별 -----
  describe('정상 케이스: 반복 유형 판별', () => {
    it('TC-U2-1-1: daily 반복 일정을 true로 판별', () => {
      // Arrange
      const event = {
        id: '1',
        title: '매일 회의',
        repeat: { type: 'daily', interval: 1 },
      };

      // Act
      const result = isRepeatingEvent(event as unknown as Event);

      // Assert
      expect(result).toBe(true);
    });

    it('TC-U2-1-2: weekly 반복 일정을 true로 판별', () => {
      // Arrange
      const event = {
        id: '2',
        title: '매주 회의',
        repeat: { type: 'weekly', interval: 1 },
      };

      // Act
      const result = isRepeatingEvent(event as unknown as Event);

      // Assert
      expect(result).toBe(true);
    });

    it('TC-U2-1-3: monthly 반복 일정을 true로 판별', () => {
      // Arrange
      const event = {
        id: '3',
        title: '매월 보고',
        repeat: { type: 'monthly', interval: 1 },
      };

      // Act
      const result = isRepeatingEvent(event as unknown as Event);

      // Assert
      expect(result).toBe(true);
    });

    it('TC-U2-1-4: yearly 반복 일정을 true로 판별', () => {
      // Arrange
      const event = {
        id: '4',
        title: '연간 평가',
        repeat: { type: 'yearly', interval: 1 },
      };

      // Act
      const result = isRepeatingEvent(event as unknown as Event);

      // Assert
      expect(result).toBe(true);
    });

    it('TC-U2-1-5: 일반 일정(none)을 false로 판별', () => {
      // Arrange
      const event = {
        id: '5',
        title: '일반 회의',
        repeat: { type: 'none', interval: 1 },
      };

      // Act
      const result = isRepeatingEvent(event as unknown as Event);

      // Assert
      expect(result).toBe(false);
    });
  });

  // ----- 엣지 케이스: 안전한 처리 -----
  describe('엣지 케이스: 안전한 처리', () => {
    it('TC-U2-1-6: repeat 속성 없을 때 false 반환', () => {
      // Arrange
      const event = {
        id: '6',
        title: '속성 없음',
      };

      // Act
      const result = isRepeatingEvent(event as unknown as Event);

      // Assert
      expect(result).toBe(false);
    });

    it('TC-U2-1-7: repeat.type 없을 때 false 반환', () => {
      // Arrange
      const event = {
        id: '7',
        title: '불완전한 객체',
        repeat: {},
      };

      // Act
      const result = isRepeatingEvent(event as unknown as Event);

      // Assert
      expect(result).toBe(false);
    });

    it('TC-U2-1-8: null 입력 시 false 반환', () => {
      // Arrange
      const event = null;

      // Act
      const result = isRepeatingEvent(event);

      // Assert
      expect(result).toBe(false);
    });

    it('TC-U2-1-9: undefined 입력 시 false 반환', () => {
      // Arrange
      const event = undefined;

      // Act
      const result = isRepeatingEvent(event);

      // Assert
      expect(result).toBe(false);
    });
  });
});
