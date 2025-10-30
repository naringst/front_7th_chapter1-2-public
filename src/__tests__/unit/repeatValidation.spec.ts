/**
 * Unit Test: repeatValidation
 * 
 * 반복 일정의 종료 날짜 검증 로직을 테스트합니다.
 */

import { describe, expect, it } from 'vitest';

// TODO: Stage 7에서 구현 예정
import { validateRepeatEndDate } from '../../utils/repeatValidation';

describe('repeatValidation', () => {
  describe('validateRepeatEndDate', () => {
    it('TC-V-1: 종료 날짜가 시작 날짜보다 이전이면 invalid', () => {
      // Arrange
      const startDate = '2025-10-15';
      const endDate = '2025-10-10';

      // Act
      const result = validateRepeatEndDate(startDate, endDate);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.error).toBe('종료 날짜는 시작 날짜 이후여야 합니다');
    });

    it('TC-V-2: 종료 날짜가 시작 날짜와 같으면 valid', () => {
      // Arrange
      const startDate = '2025-10-15';
      const endDate = '2025-10-15';

      // Act
      const result = validateRepeatEndDate(startDate, endDate);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('TC-V-3: 종료 날짜가 시작 날짜보다 이후면 valid', () => {
      // Arrange
      const startDate = '2025-10-15';
      const endDate = '2025-10-20';

      // Act
      const result = validateRepeatEndDate(startDate, endDate);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('TC-V-4: 종료 날짜가 undefined면 valid (기본값 적용)', () => {
      // Arrange
      const startDate = '2025-10-15';
      const endDate = undefined;

      // Act
      const result = validateRepeatEndDate(startDate, endDate);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('TC-V-5: 종료 날짜가 빈 문자열이면 valid (기본값 적용)', () => {
      // Arrange
      const startDate = '2025-10-15';
      const endDate = '';

      // Act
      const result = validateRepeatEndDate(startDate, endDate);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('TC-V-6: 잘못된 날짜 형식이면 invalid', () => {
      // Arrange
      const startDate = '2025-10-15';
      const endDate = 'invalid-date';

      // Act
      const result = validateRepeatEndDate(startDate, endDate);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.error).toBe('올바른 날짜 형식이 아닙니다');
    });
  });
});

