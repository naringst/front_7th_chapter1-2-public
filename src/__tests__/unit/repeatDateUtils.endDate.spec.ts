/**
 * Unit Test: repeatDateUtils - getRepeatEndDate
 *
 * 반복 일정의 종료 날짜 기본값 및 최대값 처리를 테스트합니다.
 */

import { describe, expect, it } from 'vitest';

// TODO: Stage 7에서 구현 예정
import { getRepeatEndDate } from '../../utils/repeatDateUtils';

describe('repeatDateUtils', () => {
  describe('getRepeatEndDate', () => {
    it('TC-G-1: undefined면 기본값 반환', () => {
      // Arrange
      const endDate = undefined;

      // Act
      const result = getRepeatEndDate(endDate);

      // Assert
      expect(result).toBe('2025-12-31');
    });

    it('TC-G-2: null이면 기본값 반환', () => {
      // Arrange
      const endDate = null as unknown as undefined;

      // Act
      const result = getRepeatEndDate(endDate);

      // Assert
      expect(result).toBe('2025-12-31');
    });

    it('TC-G-3: 빈 문자열이면 기본값 반환', () => {
      // Arrange
      const endDate = '';

      // Act
      const result = getRepeatEndDate(endDate);

      // Assert
      expect(result).toBe('2025-12-31');
    });

    it('TC-G-4: 유효한 날짜면 그대로 반환', () => {
      // Arrange
      const endDate = '2025-10-31';

      // Act
      const result = getRepeatEndDate(endDate);

      // Assert
      expect(result).toBe('2025-10-31');
    });

    it('TC-G-5: 최대값(2025-12-31)이면 그대로 반환', () => {
      // Arrange
      const endDate = '2025-12-31';

      // Act
      const result = getRepeatEndDate(endDate);

      // Assert
      expect(result).toBe('2025-12-31');
    });

    it('TC-G-6: 최대값 초과하면 최대값 반환', () => {
      // Arrange
      const endDate = '2026-01-01';

      // Act
      const result = getRepeatEndDate(endDate);

      // Assert
      expect(result).toBe('2025-12-31');
    });

    it('TC-G-7: 훨씬 미래 날짜도 최대값으로 제한', () => {
      // Arrange
      const endDate = '2027-12-31';

      // Act
      const result = getRepeatEndDate(endDate);

      // Assert
      expect(result).toBe('2025-12-31');
    });

    it('TC-G-8: 과거 날짜는 그대로 반환 (시작 날짜 검증은 별도)', () => {
      // Arrange
      const endDate = '2024-12-31';

      // Act
      const result = getRepeatEndDate(endDate);

      // Assert
      expect(result).toBe('2024-12-31');
    });
  });
});
