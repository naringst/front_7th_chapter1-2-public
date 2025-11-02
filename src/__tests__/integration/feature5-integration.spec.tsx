/**
 * Integration Test: Feature 5 - 반복 일정 삭제
 * Epic: 반복 일정 삭제 관리
 *
 * 이 테스트는 반복 일정 삭제 시 단일/전체 삭제 모드 선택 및 동작을 검증합니다.
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { beforeEach, describe, expect, it } from 'vitest';

import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';

// Mock repeating events for deletion (same group)
const mockRepeatingEventsForDeletion: Event[] = [
  {
    id: 'repeat-del-1',
    title: '회의',
    date: '2025-10-06', // 월요일
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 회의',
    location: '회의실',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
  },
  {
    id: 'repeat-del-2',
    title: '회의',
    date: '2025-10-13', // 다음 주 월요일
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 회의',
    location: '회의실',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
  },
  {
    id: 'repeat-del-3',
    title: '회의',
    date: '2025-10-20', // 다다음 주 월요일
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 회의',
    location: '회의실',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
  },
];

const mockNormalEventForDeletion: Event = {
  id: 'normal-del-1',
  title: '일반 일정',
  date: '2025-10-07',
  startTime: '14:00',
  endTime: '15:00',
  description: '일반 일정 설명',
  location: '장소',
  category: '개인',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 10,
};

// Mock for exercise repeating events (used in TC-5-2-3)
const mockExerciseEvents: Event[] = [
  {
    id: 'exercise-1',
    title: '운동',
    date: '2025-10-02', // 목요일
    startTime: '18:00',
    endTime: '19:00',
    description: '주간 운동',
    location: '헬스장',
    category: '개인',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
  },
  {
    id: 'exercise-2',
    title: '운동',
    date: '2025-10-09', // 다음 주 목요일
    startTime: '18:00',
    endTime: '19:00',
    description: '주간 운동',
    location: '헬스장',
    category: '개인',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
  },
  {
    id: 'exercise-3',
    title: '운동',
    date: '2025-10-16', // 다다음 주 목요일
    startTime: '18:00',
    endTime: '19:00',
    description: '주간 운동',
    location: '헬스장',
    category: '개인',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
  },
];

// Mock for study repeating events (used in TC-5-3-1, TC-5-3-3)
const mockStudyEvents: Event[] = [
  {
    id: 'study-a',
    title: '스터디',
    date: '2025-10-01', // 수요일
    startTime: '19:00',
    endTime: '21:00',
    description: '주간 스터디',
    location: '스터디룸',
    category: '학습',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
  },
  {
    id: 'study-b',
    title: '스터디',
    date: '2025-10-08', // 다음 주 수요일
    startTime: '19:00',
    endTime: '21:00',
    description: '주간 스터디',
    location: '스터디룸',
    category: '학습',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
  },
  {
    id: 'study-c',
    title: '스터디',
    date: '2025-10-15', // 다다음 주 수요일
    startTime: '19:00',
    endTime: '21:00',
    description: '주간 스터디',
    location: '스터디룸',
    category: '학습',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
  },
];

// Mock for meeting repeating events (used in TC-5-3-3)
const mockMeetingEvents: Event[] = [
  {
    id: 'meeting-1',
    title: '미팅',
    date: '2025-10-03', // 금요일
    startTime: '15:00',
    endTime: '16:00',
    description: '주간 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
  },
  {
    id: 'meeting-2',
    title: '미팅',
    date: '2025-10-10', // 다음 주 금요일
    startTime: '15:00',
    endTime: '16:00',
    description: '주간 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
  },
  {
    id: 'meeting-3',
    title: '미팅',
    date: '2025-10-17', // 다다음 주 금요일
    startTime: '15:00',
    endTime: '16:00',
    description: '주간 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
  },
  {
    id: 'meeting-4',
    title: '미팅',
    date: '2025-10-24', // 3주 후 금요일
    startTime: '15:00',
    endTime: '16:00',
    description: '주간 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
  },
];

const renderApp = () => {
  return render(
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  );
};

/**
 * Helper function to find delete button for an event in the event list
 */
const findDeleteButton = (eventTitle: string, index: number = 0): HTMLElement => {
  const eventList = screen.getByTestId('event-list');
  const eventTitles = within(eventList).getAllByText(eventTitle);
  const targetEvent = eventTitles[index];

  // Find the delete button associated with this event
  // The event title is nested inside: Box > Stack > Stack > Typography
  // We need to go up to the Box level
  const eventContainer = targetEvent.closest('.MuiBox-root');
  if (!eventContainer) {
    throw new Error(`Could not find event container for ${eventTitle}`);
  }

  const deleteButton = within(eventContainer as HTMLElement).getByLabelText('삭제');
  return deleteButton;
};

describe('FEATURE5: 반복 일정 삭제 (Epic: 반복 일정 삭제 관리)', () => {
  // ----- Story 1: 반복 일정 삭제 모드 선택 -----
  describe('Story 1: 반복 일정 삭제 모드 선택', () => {
    beforeEach(() => {
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [...mockRepeatingEventsForDeletion, mockNormalEventForDeletion],
          });
        })
      );
    });

    it('TC-5-1-1: 반복 일정 삭제 클릭 시 확인 다이얼로그가 표시된다', async () => {
      // Arrange
      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 반복 일정의 삭제 버튼 클릭
      const deleteButton = findDeleteButton('회의', 0);
      await userEvent.click(deleteButton);

      // Assert: 다이얼로그 표시 확인
      await waitFor(() => {
        expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: '예' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '아니오' })).toBeInTheDocument();
    });

    it('TC-5-1-2: 일반 일정 삭제 시 다이얼로그 없이 즉시 삭제된다', async () => {
      // Arrange: DELETE API 모킹
      const deletedIds: string[] = [];
      server.use(
        http.delete('/api/events/:id', ({ params }) => {
          const id = params.id as string;
          deletedIds.push(id);
          return HttpResponse.json({ success: true });
        })
      );

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 일반 일정의 삭제 버튼 클릭
      const deleteButton = findDeleteButton('일반 일정', 0);
      await userEvent.click(deleteButton);

      // Assert: 다이얼로그가 표시되지 않음
      expect(screen.queryByText('해당 일정만 삭제하시겠어요?')).not.toBeInTheDocument();

      // Assert: DELETE API 즉시 호출
      await waitFor(() => {
        expect(deletedIds).toContain('normal-del-1');
      });

      // Assert: 스낵바 메시지 표시
      await waitFor(() => {
        expect(screen.getByText('일정이 삭제되었습니다.')).toBeInTheDocument();
      });
    });
  });

  // ----- Story 2: 단일 일정 삭제 -----
  describe('Story 2: 단일 일정 삭제', () => {
    beforeEach(() => {
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: mockRepeatingEventsForDeletion,
          });
        })
      );
    });

    it('TC-5-2-1: 다이얼로그에서 "예" 선택 시 해당 일정만 삭제된다', async () => {
      // Arrange: DELETE API 모킹
      const deletedIds: string[] = [];
      server.use(
        http.delete('/api/events/:id', ({ params }) => {
          const id = params.id as string;
          deletedIds.push(id);
          return HttpResponse.json({ success: true });
        })
      );

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 두 번째 반복 일정의 삭제 버튼 클릭
      const deleteButton = findDeleteButton('회의', 1);
      await userEvent.click(deleteButton);

      // Assert: 다이얼로그 표시
      await waitFor(() => {
        expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
      });

      // Act: "예" 버튼 클릭 (단일 삭제)
      const yesButton = screen.getByRole('button', { name: '예' });
      await userEvent.click(yesButton);

      // Assert: DELETE API 호출 횟수 = 1
      await waitFor(() => {
        expect(deletedIds.length).toBe(1);
      });

      // Assert: 특정 ID만 삭제됨
      expect(deletedIds).toContain('repeat-del-2');

      // Assert: 스낵바 메시지 표시
      await waitFor(() => {
        expect(screen.getByText('일정이 삭제되었습니다.')).toBeInTheDocument();
      });
    });

    it('TC-5-2-2: 단일 삭제 후 삭제 성공 메시지가 표시된다', async () => {
      // Arrange: DELETE API 모킹
      server.use(
        http.delete('/api/events/:id', () => {
          return HttpResponse.json({ success: true });
        })
      );

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 첫 번째 반복 일정 삭제 (단일 삭제)
      const deleteButton = findDeleteButton('회의', 0);
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
      });

      const yesButton = screen.getByRole('button', { name: '예' });
      await userEvent.click(yesButton);

      // Assert: 스낵바 메시지 표시
      await waitFor(() => {
        expect(screen.getByText('일정이 삭제되었습니다.')).toBeInTheDocument();
      });
    });

    it('TC-5-2-3: 단일 삭제 후 캘린더에서 해당 일정만 사라진다', async () => {
      // Arrange: GET과 DELETE API 모킹
      let eventsData = [...mockExerciseEvents];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: eventsData });
        }),
        http.delete('/api/events/:id', ({ params }) => {
          const id = params.id as string;
          eventsData = eventsData.filter((e) => e.id !== id);
          return HttpResponse.json({ success: true });
        })
      );

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Assert: 초기 상태 확인 (이벤트 리스트 기준으로 3개의 "운동" 일정)
      const listContainer = screen.getByTestId('event-list');
      const initialExerciseEvents = within(listContainer).getAllByText(/^운동$/);
      expect(initialExerciseEvents.length).toBeGreaterThanOrEqual(3);

      // Act: 첫 번째 "운동" 일정 삭제 (단일 삭제)
      const deleteButton = findDeleteButton('운동', 0);
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
      });

      const yesButton = screen.getByRole('button', { name: '예' });
      await userEvent.click(yesButton);

      // Wait for deletion to complete and calendar to re-render
      await waitFor(() => {
        expect(screen.getByText('일정이 삭제되었습니다.')).toBeInTheDocument();
      });

      // Assert: "운동" 일정이 이벤트 리스트에서 2개만 남음
      await waitFor(() => {
        const remainingExerciseEvents = within(listContainer).getAllByText(/^운동$/);
        expect(remainingExerciseEvents.length).toBe(2);
      });
    });
  });

  // ----- Story 3: 전체 반복 일정 삭제 -----
  describe('Story 3: 전체 반복 일정 삭제', () => {
    it('TC-5-3-1: 다이얼로그에서 "아니오" 선택 시 전체 반복 일정이 삭제된다', async () => {
      // Arrange: 배치 DELETE API 모킹
      let eventsData = [...mockStudyEvents];
      const deletedIds: string[] = [];
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: eventsData });
        }),
        http.delete('/api/events-list', async ({ request }) => {
          const body = (await request.json()) as { eventIds: string[] };
          deletedIds.push(...body.eventIds);
          eventsData = eventsData.filter((e) => !body.eventIds.includes(e.id));
          return new HttpResponse(null, { status: 204 });
        })
      );

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 첫 번째 "스터디" 일정의 삭제 버튼 클릭
      const deleteButton = findDeleteButton('스터디', 0);
      await userEvent.click(deleteButton);

      // Assert: 다이얼로그 표시
      await waitFor(() => {
        expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
      });

      // Act: "아니오" 버튼 클릭 (전체 삭제)
      const noButton = screen.getByRole('button', { name: '아니오' });
      await userEvent.click(noButton);

      // Assert: DELETE API 호출 시 삭제된 ID 수 = 3 (전체 그룹)
      await waitFor(
        () => {
          expect(deletedIds.length).toBe(3);
        },
        { timeout: 3000 }
      );

      // Assert: 모든 ID가 삭제됨
      expect(deletedIds).toContain('study-a');
      expect(deletedIds).toContain('study-b');
      expect(deletedIds).toContain('study-c');

      // Assert: 스낵바 메시지 표시
      await waitFor(() => {
        expect(screen.getByText(/일정.*개가 삭제되었습니다/i)).toBeInTheDocument();
      });
    });

    it('TC-5-3-2: 전체 삭제 후 삭제 성공 메시지가 표시된다', async () => {
      // Arrange: 배치 DELETE API 모킹
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockStudyEvents });
        }),
        http.delete('/api/events-list', () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: "스터디" 일정 전체 삭제
      const deleteButton = findDeleteButton('스터디', 0);
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
      });

      const noButton = screen.getByRole('button', { name: '아니오' });
      await userEvent.click(noButton);

      // Assert: 스낵바 메시지 표시
      await waitFor(
        () => {
          expect(screen.getByText(/일정.*개가 삭제되었습니다/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('TC-5-3-3: 전체 삭제 후 캘린더에서 모든 반복 일정이 사라진다', async () => {
      // Arrange: GET과 배치 DELETE API 모킹
      let eventsData = [...mockMeetingEvents];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: eventsData });
        }),
        http.delete('/api/events-list', async ({ request }) => {
          const body = (await request.json()) as { eventIds: string[] };
          eventsData = eventsData.filter((e) => !body.eventIds.includes(e.id));
          return new HttpResponse(null, { status: 204 });
        })
      );

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Assert: 초기 상태 확인 (4개의 "미팅" 일정)
      const initialMeetingEvents = screen.getAllByText('미팅');
      expect(initialMeetingEvents.length).toBeGreaterThanOrEqual(4);

      // Act: 아무 "미팅" 일정 선택하여 전체 삭제
      const deleteButton = findDeleteButton('미팅', 0);
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
      });

      const noButton = screen.getByRole('button', { name: '아니오' });
      await userEvent.click(noButton);

      // Wait for deletion to complete and calendar to re-render
      await waitFor(
        () => {
          expect(screen.getByText(/일정.*개가 삭제되었습니다/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Assert: "미팅" 일정이 캘린더에서 완전히 사라짐
      await waitFor(
        () => {
          expect(screen.queryByText('미팅')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });
});
