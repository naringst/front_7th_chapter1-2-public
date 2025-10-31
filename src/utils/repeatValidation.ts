/**
 * 반복 일정의 종료 날짜 검증 유틸리티
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 반복 일정의 종료 날짜가 유효한지 검증합니다.
 *
 * @param startDate - 시작 날짜 (YYYY-MM-DD 형식)
 * @param endDate - 종료 날짜 (YYYY-MM-DD 형식 또는 undefined)
 * @returns 검증 결과
 */
export function validateRepeatEndDate(
  startDate: string,
  endDate: string | undefined
): ValidationResult {
  // undefined나 빈 문자열인 경우 valid (기본값 적용)
  if (!endDate || endDate === '') {
    return { valid: true };
  }

  // 날짜 형식 검증
  const endDateObj = new Date(endDate);
  const startDateObj = new Date(startDate);

  if (isNaN(endDateObj.getTime())) {
    return {
      valid: false,
      error: '올바른 날짜 형식이 아닙니다',
    };
  }

  // 종료 날짜가 시작 날짜보다 이전인지 검증
  if (endDateObj.getTime() < startDateObj.getTime()) {
    return {
      valid: false,
      error: '종료 날짜는 시작 날짜 이후여야 합니다',
    };
  }

  return { valid: true };
}
