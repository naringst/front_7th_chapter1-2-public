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
      const list: Event[] = Array.isArray(data) ? data : data?.events;
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
            const updatePromises = repeatGroup.map((groupEvent) => {
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
                  repeat: eventData.repeat
                    ? { ...groupEvent.repeat, endDate: eventData.repeat.endDate }
                    : groupEvent.repeat,
                },
                'all'
              );
              return fetch(`/api/events/${groupEvent.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
              });
            });
            const responses = await Promise.all(updatePromises);
            response = responses[0];
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
