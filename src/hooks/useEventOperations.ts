import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { applyEventUpdate } from '../utils/eventUpdateUtils';
import { getRepeatEndDate } from '../utils/repeatDateUtils';
import { findRepeatGroup } from '../utils/repeatGroupUtils';
import { generateRecurringEventsUntilEndDate } from '../utils/repeatScheduler';
import { validateRepeatEndDate } from '../utils/repeatValidation';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  // 공통: 이벤트 목록 가져오기
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      // 서버는 항상 { events: [...] } 형태로 응답
      const list: Event[] = Array.isArray(data?.events)
        ? data.events
        : Array.isArray(data)
          ? data
          : [];
      if (!Array.isArray(list)) throw new Error('Invalid events payload');
      setEvents(list);
    } catch (error) {
      console.error('Error fetching events:', error);
      enqueueSnackbar('이벤트 로딩 실패', { variant: 'error' });
    }
  };

  // 저장 (생성/수정 모두)
  const saveEvent = async (
    eventData: Event | EventForm,
    editMode: 'single' | 'all' | null = null,
    allEvents: Event[] = []
  ) => {
    try {
      const isRecurring = eventData.repeat?.type && eventData.repeat.type !== 'none';

      // 1️⃣ 반복 일정의 종료 날짜 검증
      if (isRecurring) {
        const validation = validateRepeatEndDate(eventData.date, eventData.repeat.endDate);
        if (!validation.valid) {
          enqueueSnackbar(validation.error || '종료 날짜 검증 실패', { variant: 'error' });
          return;
        }
      }

      let response: Response | undefined;

      // 2️⃣ 수정 모드
      if (editing) {
        const currentEvent = eventData as Event;

        if (editMode === 'single' || editMode === 'all') {
          const originalEvent = allEvents.find((e) => e.id === currentEvent.id);
          if (!originalEvent) throw new Error('Original event not found');

          const repeatGroup = findRepeatGroup(allEvents, originalEvent);

          if (repeatGroup.length === 0) {
            throw new Error('Repeat group not found');
          }

          if (editMode === 'single') {
            // 단일 수정 → repeat.type = 'none'
            const updatedEvent = applyEventUpdate(
              originalEvent,
              {
                ...eventData,
                repeat: { type: 'none', interval: 1 },
              },
              'single'
            );
            response = await fetch(`/api/events/${currentEvent.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedEvent),
            });
          } else if (editMode === 'all') {
            // 전체 수정 → 그룹 전체 동일 필드 업데이트
            // 각 이벤트의 date는 유지하고, 나머지 필드만 업데이트
            const updatedEvents = repeatGroup.map((groupEvent) => {
              // 전체 수정: repeat.type과 interval은 유지하되, endDate만 업데이트 가능
              const updatedRepeat = eventData.repeat
                ? {
                    ...groupEvent.repeat,
                    endDate:
                      eventData.repeat.endDate !== undefined
                        ? eventData.repeat.endDate
                        : groupEvent.repeat.endDate,
                    // repeat.id는 항상 원본 유지
                    id: groupEvent.repeat.id,
                  }
                : groupEvent.repeat;

              const updated = applyEventUpdate(
                groupEvent,
                {
                  title: eventData.title,
                  startTime: eventData.startTime,
                  endTime: eventData.endTime,
                  description: eventData.description,
                  location: eventData.location,
                  category: eventData.category,
                  notificationTime: eventData.notificationTime,
                  repeat: updatedRepeat,
                  // date는 각 이벤트의 원래 날짜 유지
                },
                'all'
              );
              // date 필드를 명시적으로 보존
              updated.date = groupEvent.date;
              return updated;
            });

            // 배치 업데이트 API 사용 (더 안전함)
            response = await fetch('/api/events-list', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ events: updatedEvents }),
            });
          }
        } else {
          // 일반 일정 수정
          response = await fetch(`/api/events/${(eventData as Event).id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
          });
        }
      } else {
        // 3️⃣ 신규 생성 로직
        if (isRecurring) {
          const endDate = getRepeatEndDate(eventData.repeat.endDate);
          const recurringEvents = generateRecurringEventsUntilEndDate(eventData, endDate);
          response = await fetch('/api/events-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: recurringEvents }),
          });
        } else {
          response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
          });
        }
      }

      if (!response || !response.ok) throw new Error('Failed to save event');

      await fetchEvents();
      onSave?.();

      enqueueSnackbar(editing ? '일정이 수정되었습니다' : '일정이 추가되었습니다', {
        variant: 'success',
      });
    } catch (error) {
      console.error('Error saving event:', error);
      enqueueSnackbar('일정 저장 실패', { variant: 'error' });
    }
  };

  // 삭제
  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete event');
      await fetchEvents();
      enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
    } catch (error) {
      console.error('Error deleting event:', error);
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
    }
  };

  // 초기 로드
  const init = async () => {
    await fetchEvents();
    enqueueSnackbar('일정 로딩 완료!', { variant: 'info' });
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent };
};
