/**
 * 이벤트 수정 적용 유틸리티
 */

import type { Event } from '../types';

/**
 * 이벤트에 수정 사항을 적용합니다.
 *
 * - mode가 'single'인 경우: 단일 수정 → repeat.type을 'none'으로 변경
 * - mode가 'all'인 경우: 전체 수정 → repeat.type 유지
 * - 원본 이벤트의 repeat.type이 'none'인 경우: mode 무관하게 'none' 유지
 * - updates가 빈 객체인 경우: 원본 이벤트 그대로 반환 (repeat.type 포함)
 *
 * @param event - 원본 이벤트
 * @param updates - 수정할 필드들
 * @param mode - 수정 모드 ('single' | 'all')
 * @returns 수정이 적용된 이벤트
 */
export function applyEventUpdate(
  event: Event,
  updates: Partial<Event>,
  mode: 'single' | 'all'
): Event {
  // 기본적으로 원본 이벤트를 복사하고 updates를 병합
  const updatedEvent: Event = {
    ...event,
    ...updates,
  };

  // updates가 빈 객체면 원본 그대로 반환
  if (Object.keys(updates).length === 0) {
    return event;
  }

  // 원본 이벤트가 일반 일정이면 mode 무관하게 'none' 유지
  if (event.repeat.type === 'none') {
    updatedEvent.repeat = { ...event.repeat, type: 'none' };
    return updatedEvent;
  }

  // mode에 따라 repeat.type 처리
  if (mode === 'single') {
    // 단일 수정: repeat.type을 'none'으로 변경
    updatedEvent.repeat = { ...event.repeat, type: 'none' };
  } else if (mode === 'all') {
    // 전체 수정: repeat.type/interval은 유지하되, 업데이트에 endDate가 있으면 반영
    const nextRepeat = { ...event.repeat } as Event['repeat'];
    const updatesRepeat = updates.repeat as Event['repeat'] | undefined;
    if (updatesRepeat && typeof updatesRepeat.endDate !== 'undefined') {
      nextRepeat.endDate = updatesRepeat.endDate;
    }
    updatedEvent.repeat = nextRepeat;
  }

  return updatedEvent;
}
