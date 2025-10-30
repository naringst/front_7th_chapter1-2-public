/**
 * 반복 일정 그룹 식별 유틸리티
 */

import type { Event } from '../types';

/**
 * 주어진 이벤트와 같은 반복 그룹에 속하는 모든 이벤트를 찾습니다.
 *
 * 같은 그룹의 조건:
 * - 제목(title)이 동일
 * - 시작 시간(startTime)이 동일
 * - 종료 시간(endTime)이 동일
 * - 반복 유형(repeat.type)이 동일
 * - 반복 간격(repeat.interval)이 동일
 * - 반복 유형이 'none'이 아님 (일반 일정은 그룹에 속하지 않음)
 *
 * @param events - 검색 대상 이벤트 배열
 * @param targetEvent - 그룹을 찾을 기준 이벤트
 * @returns 같은 그룹에 속하는 이벤트 배열
 */
export function findRepeatGroup(events: Event[], targetEvent: Event): Event[] {
  // 빈 배열이면 빈 배열 반환
  if (events.length === 0) {
    return [];
  }

  // 일반 일정 (repeat.type = 'none')은 그룹에 속하지 않음
  // 자기 자신만 반환
  if (targetEvent.repeat.type === 'none') {
    const found = events.find((e) => e.id === targetEvent.id);
    return found ? [found] : [];
  }

  // targetEvent가 events 배열에 없으면 빈 배열 반환
  const exists = events.some((e) => e.id === targetEvent.id);
  if (!exists) {
    return [];
  }

  // 같은 그룹 조건으로 필터링
  return events.filter(
    (event) =>
      event.title === targetEvent.title &&
      event.startTime === targetEvent.startTime &&
      event.endTime === targetEvent.endTime &&
      event.repeat.type === targetEvent.repeat.type &&
      event.repeat.interval === targetEvent.repeat.interval &&
      event.repeat.type !== 'none' // 일반 일정 제외
  );
}
