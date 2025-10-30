/**
 * Integration Test: Feature 4 - 반복 일정 수정
 * Epic: 반복 일정 수정 관리
 *
 * 이 테스트는 반복 일정 수정 시 단일/전체 수정 모드 선택 및 동작을 검증합니다.
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { server } from '../../setupTests';
import App from '../../App';
import { Event } from '../../types';

// Mock repeating events (same group)
const mockRepeatingEvents: Event[] = [
  {
    id: 'repeat-mon-1',
    title: '팀 미팅',
    date: '2025-10-06', // 월요일
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
  },
  {
    id: 'repeat-mon-2',
    title: '팀 미팅',
    date: '2025-10-13', // 다음 주 월요일
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
  },
  {
    id: 'repeat-mon-3',
    title: '팀 미팅',
    date: '2025-10-20', // 다다음 주 월요일
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
  },
];

const mockNormalEvent: Event = {
  id: 'normal-1',
  title: '일반 회의',
  date: '2025-10-07',
  startTime: '14:00',
  endTime: '15:00',
  description: '일반 일정',
  location: '사무실',
  category: '업무',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 10,
};

const renderApp = () => {
  return render(
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  );
};

describe('FEATURE4: 반복 일정 수정 (Epic: 반복 일정 수정 관리)', () => {
  beforeEach(() => {
    // MSW 핸들러를 사용하여 Mock 데이터 설정
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [...mockRepeatingEvents, mockNormalEvent],
        });
      })
    );
  });

  // ----- Story 1: 단일 반복 일정 수정 -----
  describe('Story 1: 단일 반복 일정 수정', () => {
    it('TC-4-1-1: 단일 수정 선택 시 해당 일정만 수정되고 반복 속성이 제거된다', async () => {
      // Arrange: MSW로 PUT 요청 모킹
      let updatedEvent: Event | null = null;
      server.use(
        http.put('/api/events/:id', async ({ params, request }) => {
          const id = params.id as string;
          const body = (await request.json()) as Event;
          
          if (id === 'repeat-mon-1') {
            updatedEvent = body;
          }
          
          return HttpResponse.json(body);
        })
      );

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 첫 번째 반복 일정 클릭 및 수정
      const eventList = screen.getByTestId('event-list');
      const firstEvent = within(eventList).getAllByText('팀 미팅')[0];
      await userEvent.click(firstEvent);

      // 수정 버튼 클릭
      const editButton = screen.getByRole('button', { name: /수정/i });
      await userEvent.click(editButton);

      // 다이얼로그에서 "예" (단일 수정) 선택
      const yesButton = await screen.findByRole('button', { name: /예/i });
      await userEvent.click(yesButton);

      // 제목 수정
      const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, '개인 미팅');

      // 저장
      const saveButton = screen.getByRole('button', { name: /일정 (추가|저장)/i });
      await userEvent.click(saveButton);

      // Assert
      await screen.findByText('일정이 수정되었습니다');
      expect(updatedEvent).not.toBeNull();
      expect(updatedEvent?.title).toBe('개인 미팅');
      expect(updatedEvent?.repeat.type).toBe('none');
    });

    it('TC-4-1-2: 단일 수정 후 해당 일정의 반복 아이콘이 사라진다', async () => {
      // Arrange: 단일 수정 완료된 일정 (repeat.type = 'none')
      const modifiedEvent: Event = {
        ...mockRepeatingEvents[0],
        id: 'repeat-mon-1',
        title: '개인 미팅',
        repeat: { type: 'none', interval: 1 },
      };

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [modifiedEvent, mockRepeatingEvents[1], mockRepeatingEvents[2]],
          });
        })
      );

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 일정 목록 확인
      const eventList = screen.getByTestId('event-list');

      // Assert: "개인 미팅" 주변에 반복 아이콘 없음
      const personalMeeting = within(eventList).getByText('개인 미팅');
      const container = personalMeeting.closest('[role="button"]') || personalMeeting.parentElement;
      
      if (container) {
        const icons = within(container).queryAllByLabelText('반복 일정');
        expect(icons).toHaveLength(0);
      }

      // "팀 미팅" (나머지 반복 일정)은 아이콘 유지
      const teamMeetings = within(eventList).getAllByText('팀 미팅');
      expect(teamMeetings.length).toBeGreaterThan(0);
    });

    it('TC-4-1-3: 단일 수정 시 나머지 반복 일정은 유지된다', async () => {
      // Arrange: PUT 요청 모킹 (1번만 호출되어야 함)
      const putCalls: string[] = [];
      server.use(
        http.put('/api/events/:id', async ({ params, request }) => {
          const id = params.id as string;
          putCalls.push(id);
          const body = (await request.json()) as Event;
          return HttpResponse.json(body);
        })
      );

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 두 번째 반복 일정 수정
      const eventList = screen.getByTestId('event-list');
      const secondEvent = within(eventList).getAllByText('팀 미팅')[1];
      await userEvent.click(secondEvent);

      const editButton = screen.getByRole('button', { name: /수정/i });
      await userEvent.click(editButton);

      // "예" 선택
      const yesButton = await screen.findByRole('button', { name: /예/i });
      await userEvent.click(yesButton);

      // 시간 수정
      const startTimeInput = screen.getByLabelText('시작 시간') as HTMLInputElement;
      await userEvent.clear(startTimeInput);
      await userEvent.type(startTimeInput, '11:00');

      const saveButton = screen.getByRole('button', { name: /일정 (추가|저장)/i });
      await userEvent.click(saveButton);

      // Assert: PUT 호출 1번만 (두 번째 일정만)
      await screen.findByText('일정이 수정되었습니다');
      expect(putCalls).toHaveLength(1);
      expect(putCalls[0]).toBe('repeat-mon-2');
    });
  });

  // ----- Story 2: 전체 반복 일정 수정 -----
  describe('Story 2: 전체 반복 일정 수정', () => {
    it('TC-4-2-1: 전체 수정 선택 시 모든 반복 일정이 수정되고 반복 속성이 유지된다', async () => {
      // Arrange: PUT 요청 모킹
      const updatedEvents: { [id: string]: Event } = {};
      server.use(
        http.put('/api/events/:id', async ({ params, request }) => {
          const id = params.id as string;
          const body = (await request.json()) as Event;
          updatedEvents[id] = body;
          return HttpResponse.json(body);
        })
      );

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 첫 번째 반복 일정 수정
      const eventList = screen.getByTestId('event-list');
      const firstEvent = within(eventList).getAllByText('팀 미팅')[0];
      await userEvent.click(firstEvent);

      const editButton = screen.getByRole('button', { name: /수정/i });
      await userEvent.click(editButton);

      // "아니오" (전체 수정) 선택
      const noButton = await screen.findByRole('button', { name: /아니오/i });
      await userEvent.click(noButton);

      // 제목 수정
      const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, '헬스');

      const saveButton = screen.getByRole('button', { name: /일정 (추가|저장)/i });
      await userEvent.click(saveButton);

      // Assert: 3번 PUT 호출, 모든 repeat.type = 'weekly', 모든 title = '헬스'
      await screen.findByText('일정이 수정되었습니다');
      expect(Object.keys(updatedEvents)).toHaveLength(3);
      
      for (const id of ['repeat-mon-1', 'repeat-mon-2', 'repeat-mon-3']) {
        expect(updatedEvents[id]).toBeDefined();
        expect(updatedEvents[id].title).toBe('헬스');
        expect(updatedEvents[id].repeat.type).toBe('weekly');
      }
    });

    it('TC-4-2-2: 전체 수정 후 모든 일정의 반복 아이콘이 유지된다', async () => {
      // Arrange: 전체 수정 완료된 반복 일정들 (모두 "헬스")
      const modifiedEvents: Event[] = mockRepeatingEvents.map((event) => ({
        ...event,
        title: '헬스',
      }));

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: modifiedEvents });
        })
      );

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 일정 목록 확인
      const eventList = screen.getByTestId('event-list');
      const allIcons = within(eventList).queryAllByLabelText('반복 일정');

      // Assert: 모든 일정에 반복 아이콘 표시
      expect(allIcons.length).toBeGreaterThanOrEqual(3);
    });

    it('TC-4-2-3: 전체 수정 시 반복 유형이 유지된다', async () => {
      // Arrange: 매월 반복 일정
      const monthlyEvents: Event[] = [
        {
          id: 'monthly-1',
          title: '월례 회의',
          date: '2025-10-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'monthly', interval: 1 },
          notificationTime: 10,
        },
        {
          id: 'monthly-2',
          title: '월례 회의',
          date: '2025-11-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'monthly', interval: 1 },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: monthlyEvents });
        })
      );

      const updatedEvents: { [id: string]: Event } = {};
      server.use(
        http.put('/api/events/:id', async ({ params, request }) => {
          const id = params.id as string;
          const body = (await request.json()) as Event;
          updatedEvents[id] = body;
          return HttpResponse.json(body);
        })
      );

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 첫 번째 일정 수정
      const eventList = screen.getByTestId('event-list');
      const firstEvent = within(eventList).getAllByText('월례 회의')[0];
      await userEvent.click(firstEvent);

      const editButton = screen.getByRole('button', { name: /수정/i });
      await userEvent.click(editButton);

      const noButton = await screen.findByRole('button', { name: /아니오/i });
      await userEvent.click(noButton);

      // 시간만 수정
      const startTimeInput = screen.getByLabelText('시작 시간') as HTMLInputElement;
      await userEvent.clear(startTimeInput);
      await userEvent.type(startTimeInput, '10:00');

      const saveButton = screen.getByRole('button', { name: /일정 (추가|저장)/i });
      await userEvent.click(saveButton);

      // Assert: 모든 repeat.type = 'monthly'
      await screen.findByText('일정이 수정되었습니다');
      expect(Object.keys(updatedEvents)).toHaveLength(2);
      
      for (const id of ['monthly-1', 'monthly-2']) {
        expect(updatedEvents[id].repeat.type).toBe('monthly');
      }
    });
  });

  // ----- Story 3: 수정 확인 다이얼로그 표시 -----
  describe('Story 3: 수정 확인 다이얼로그 표시', () => {
    it('TC-4-3-1: 반복 일정 수정 시 다이얼로그가 표시된다', async () => {
      // Arrange
      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 반복 일정 클릭 및 수정 버튼
      const eventList = screen.getByTestId('event-list');
      const repeatingEvent = within(eventList).getAllByText('팀 미팅')[0];
      await userEvent.click(repeatingEvent);

      const editButton = screen.getByRole('button', { name: /수정/i });
      await userEvent.click(editButton);

      // Assert: 다이얼로그 표시
      expect(await screen.findByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /예/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /아니오/i })).toBeInTheDocument();
    });

    it('TC-4-3-2: 다이얼로그에서 "예" 선택 시 단일 수정 모드로 진행된다', async () => {
      // Arrange
      renderApp();
      await screen.findByText('일정 로딩 완료!');

      const eventList = screen.getByTestId('event-list');
      const repeatingEvent = within(eventList).getAllByText('팀 미팅')[0];
      await userEvent.click(repeatingEvent);

      const editButton = screen.getByRole('button', { name: /수정/i });
      await userEvent.click(editButton);

      // Act: "예" 선택
      const yesButton = await screen.findByRole('button', { name: /예/i });
      await userEvent.click(yesButton);

      // Assert: 다이얼로그 닫힘, 수정 폼 표시
      expect(screen.queryByText('해당 일정만 수정하시겠어요?')).not.toBeInTheDocument();
      expect(screen.getByLabelText('제목')).toBeInTheDocument();
    });

    it('TC-4-3-3: 다이얼로그에서 "아니오" 선택 시 전체 수정 모드로 진행된다', async () => {
      // Arrange
      renderApp();
      await screen.findByText('일정 로딩 완료!');

      const eventList = screen.getByTestId('event-list');
      const repeatingEvent = within(eventList).getAllByText('팀 미팅')[0];
      await userEvent.click(repeatingEvent);

      const editButton = screen.getByRole('button', { name: /수정/i });
      await userEvent.click(editButton);

      // Act: "아니오" 선택
      const noButton = await screen.findByRole('button', { name: /아니오/i });
      await userEvent.click(noButton);

      // Assert: 다이얼로그 닫힘, 수정 폼 표시
      expect(screen.queryByText('해당 일정만 수정하시겠어요?')).not.toBeInTheDocument();
      expect(screen.getByLabelText('제목')).toBeInTheDocument();
    });

    it('TC-4-3-4: 일반 일정 수정 시 다이얼로그가 표시되지 않는다', async () => {
      // Arrange
      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 일반 일정 클릭 및 수정 버튼
      const eventList = screen.getByTestId('event-list');
      const normalEvent = within(eventList).getByText('일반 회의');
      await userEvent.click(normalEvent);

      const editButton = screen.getByRole('button', { name: /수정/i });
      await userEvent.click(editButton);

      // Assert: 다이얼로그 표시되지 않음, 바로 수정 폼 표시
      expect(screen.queryByText('해당 일정만 수정하시겠어요?')).not.toBeInTheDocument();
      expect(screen.getByLabelText('제목')).toBeInTheDocument();
    });
  });
});

