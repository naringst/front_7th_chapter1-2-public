import { describe, it, expect } from 'vitest';

import { getRepeatOptionLabel, getRepeatOptions } from '../../utils/repeatOptionsProvider';

describe('RepeatOptionsProvider', () => {
  describe('getRepeatOptions', () => {
    it('getRepeatOptions - 반복 유형 옵션 배열을 반환한다', () => {
      const result = getRepeatOptions();

      expect(result).toEqual(['daily', 'weekly', 'monthly', 'yearly']);
    });

    it('getRepeatOptions - 옵션 순서가 일관되게 유지된다', () => {
      const result1 = getRepeatOptions();
      const result2 = getRepeatOptions();

      expect(result1).toEqual(result2);
    });
  });

  describe('getRepeatOptionLabel', () => {
    it('getRepeatOptionLabel - 각 반복 유형에 대응하는 한글 레이블을 반환한다', () => {
      expect(getRepeatOptionLabel('daily')).toBe('매일');
      expect(getRepeatOptionLabel('weekly')).toBe('매주');
      expect(getRepeatOptionLabel('monthly')).toBe('매월');
      expect(getRepeatOptionLabel('yearly')).toBe('매년');
    });

    it('getRepeatOptionLabel - none 타입에 대한 레이블을 반환한다', () => {
      expect(getRepeatOptionLabel('none')).toBe('반복 안함');
    });
  });
});
