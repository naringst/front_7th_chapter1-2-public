import type { Event, EventForm } from '../types';

/**
 * 이벤트가 반복 일정인지 확인
 *
 * @param event - 검증할 이벤트 객체 (null/undefined 안전)
 * @returns 반복 일정이면 true, 일반 일정(none) 또는 유효하지 않으면 false
 *
 * @example
 * isRepeatingEvent({ repeat: { type: 'daily' } })   // true
 * isRepeatingEvent({ repeat: { type: 'none' } })    // false
 * isRepeatingEvent({})                              // false
 * isRepeatingEvent(null)                            // false
 */
export function isRepeatingEvent(event: Event | EventForm | null | undefined): boolean {
  return event?.repeat?.type !== undefined && event.repeat.type !== 'none';
}

