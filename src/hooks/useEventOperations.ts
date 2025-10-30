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

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      enqueueSnackbar('이벤트 로딩 실패', { variant: 'error' });
    }
  };

  const saveEvent = async (
    eventData: Event | EventForm,
    editMode: 'single' | 'all' | null = null,
    allEvents: Event[] = []
  ) => {
    try {
      // 반복 일정인 경우 종료 날짜 검증
      const isRecurring = eventData.repeat.type !== 'none';
      if (isRecurring) {
        const validation = validateRepeatEndDate(eventData.date, eventData.repeat.endDate);

        if (!validation.valid) {
          enqueueSnackbar(validation.error || '종료 날짜 검증 실패', {
            variant: 'error',
          });
          return;
        }
      }

      let response;
      if (editing) {
        // Feature 4: Handle edit mode for repeating events
        if (editMode === 'single' || editMode === 'all') {
          const currentEvent = eventData as Event;

          // Find the original event from allEvents to get the repeat group
          const originalEvent = allEvents.find((e) => e.id === currentEvent.id);
          if (!originalEvent) {
            throw new Error('Original event not found');
          }

          // Find the repeat group using the original event
          const repeatGroup = findRepeatGroup(allEvents, originalEvent);

          if (editMode === 'single') {
            // Single edit: Update only this event, set repeat.type to 'none'
            // Apply updates from eventData to originalEvent
            const updatedEvent = applyEventUpdate(originalEvent, eventData, 'single');
            response = await fetch(`/api/events/${currentEvent.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedEvent),
            });
          } else {
            // All edit: Update all events in the group, keep repeat.type
            const updatePromises = repeatGroup.map(async (groupEvent) => {
              // For each event in the group, apply the updates but keep the original date
              const updatedEvent = {
                ...groupEvent,
                ...eventData,
                id: groupEvent.id, // Keep original ID
                date: groupEvent.date, // Keep original date
                repeat: { ...groupEvent.repeat }, // Keep original repeat settings
              };
              // Apply mode-specific logic
              const finalEvent = applyEventUpdate(groupEvent, updatedEvent, 'all');
              return fetch(`/api/events/${groupEvent.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalEvent),
              });
            });

            const responses = await Promise.all(updatePromises);
            response = responses[0]; // Use first response for success check
          }
        } else {
          // Normal edit (no edit mode specified, or normal event)
          response = await fetch(`/api/events/${(eventData as Event).id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
          });
        }
      } else {
        if (isRecurring) {
          // 종료 날짜 적용 (기본값: 2025-12-31)
          const endDate = getRepeatEndDate(eventData.repeat.endDate);

          // Generate recurring events until endDate
          const recurringEvents = generateRecurringEventsUntilEndDate(eventData, endDate);

          // Send to /api/events-list for batch creation
          response = await fetch('/api/events-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: recurringEvents }),
          });
        } else {
          // Single event creation
          response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
          });
        }
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();
      enqueueSnackbar(editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.', {
        variant: 'success',
      });
    } catch (error) {
      console.error('Error saving event:', error);
      enqueueSnackbar('일정 저장 실패', { variant: 'error' });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
    } catch (error) {
      console.error('Error deleting event:', error);
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
    }
  };

  async function init() {
    await fetchEvents();
    enqueueSnackbar('일정 로딩 완료!', { variant: 'info' });
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent };
};
