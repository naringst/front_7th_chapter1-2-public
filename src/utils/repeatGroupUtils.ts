/**
 * 반복 일정 그룹 식별 유틸리티
 */

import type { Event } from '../types';

/**
 * 주어진 이벤트와 같은 반복 그룹에 속하는 모든 이벤트를 찾습니다.
 *
 * 같은 그룹의 조건 (우선순위):
 * 1. repeat.id가 있는 경우: repeat.id가 동일한 모든 이벤트
 * 2. repeat.id가 없는 경우: 제목, 시작 시간, 종료 시간, 반복 유형, 반복 간격이 모두 동일한 이벤트
 * - 반복 유형이 'none'이 아닌 경우만 (일반 일정은 그룹에 속하지 않음)
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

  // repeat.id가 있으면 repeat.id로 그룹 찾기 (가장 정확한 방법)
  if (targetEvent.repeat.id) {
    const groupById = events.filter(
      (event) => event.repeat.id === targetEvent.repeat.id && event.repeat.type !== 'none'
    );
    // repeat.id로 그룹을 찾았으면 반환
    if (groupById.length > 0) {
      return groupById;
    }
    // repeat.id로 찾지 못했으면 fallback 로직 사용 (repeat.id가 없는 이벤트도 포함)
  }

  // repeat.id가 없으면 기존 로직 사용 (제목, 시간, 반복 유형/간격으로 그룹 찾기)
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
