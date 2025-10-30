import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import App from '../App';
import { Event } from '../types';

// Mock API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock server response
const mockEvents: Event[] = [];

const renderApp = () => {
  return render(
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  );
};

describe('FEATURE1: 반복 유형 선택', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ events: mockEvents }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  describe('Story 1: 반복 설정 활성화', () => {
    it('TC-1-1 - 반복 설정 체크박스 클릭 시 반복 드롭다운이 표시된다', async () => {
      renderApp();

      const repeatCheckbox = screen.getByLabelText('반복 일정');

      // 반복 드롭다운이 처음에는 보이지 않음을 확인
      expect(screen.queryByLabelText('반복 유형')).not.toBeInTheDocument();

      await userEvent.click(repeatCheckbox);

      // 체크박스가 체크되었는지 확인
      expect(repeatCheckbox).toBeChecked();

      // 반복 드롭다운이 표시되는지 확인
      await waitFor(() => {
        expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      });
    });

    it('TC-1-2 - 반복 설정 체크박스 해제 시 반복 드롭다운이 숨겨진다', async () => {
      renderApp();

      const repeatCheckbox = screen.getByLabelText('반복 일정');

      // 체크박스 클릭하여 활성화
      await userEvent.click(repeatCheckbox);

      await waitFor(() => {
        expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      });

      // 다시 클릭하여 해제
      await userEvent.click(repeatCheckbox);

      // 체크박스가 해제되었는지 확인
      expect(repeatCheckbox).not.toBeChecked();

      // 반복 드롭다운이 숨겨졌는지 확인
      expect(screen.queryByLabelText('반복 유형')).not.toBeInTheDocument();
    });

    it('TC-1-3 - 반복 설정 토글 동작이 정상적으로 작동한다', async () => {
      renderApp();

      const repeatCheckbox = screen.getByLabelText('반복 일정');

      // 첫 번째 클릭 - 활성화
      await userEvent.click(repeatCheckbox);
      expect(repeatCheckbox).toBeChecked();
      await waitFor(() => {
        expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      });

      // 두 번째 클릭 - 비활성화
      await userEvent.click(repeatCheckbox);
      expect(repeatCheckbox).not.toBeChecked();
      expect(screen.queryByLabelText('반복 유형')).not.toBeInTheDocument();

      // 세 번째 클릭 - 다시 활성화
      await userEvent.click(repeatCheckbox);
      expect(repeatCheckbox).toBeChecked();
      await waitFor(() => {
        expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      });
    });
  });

  describe('Story 2: 반복 유형 선택', () => {
    it('TC-2-1 - 매일 반복 선택 시 매일 반복 설정이 적용된다', async () => {
      renderApp();

      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await userEvent.click(repeatCheckbox);

      await waitFor(() => {
        expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      });

      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await userEvent.selectOptions(repeatTypeSelect, 'daily');

      expect(repeatTypeSelect).toHaveValue('daily');
    });

    it('TC-2-2 - 매주 반복 선택 시 매주 반복 설정이 적용된다', async () => {
      renderApp();

      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await userEvent.click(repeatCheckbox);

      await waitFor(() => {
        expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      });

      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await userEvent.selectOptions(repeatTypeSelect, 'weekly');

      expect(repeatTypeSelect).toHaveValue('weekly');
    });

    it('TC-2-3 - 매월 반복 선택 시 매월 반복 설정이 적용된다', async () => {
      renderApp();

      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await userEvent.click(repeatCheckbox);

      await waitFor(() => {
        expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      });

      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await userEvent.selectOptions(repeatTypeSelect, 'monthly');

      expect(repeatTypeSelect).toHaveValue('monthly');
    });

    it('TC-2-4 - 매년 반복 선택 시 매년 반복 설정이 적용된다', async () => {
      renderApp();

      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await userEvent.click(repeatCheckbox);

      await waitFor(() => {
        expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      });

      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await userEvent.selectOptions(repeatTypeSelect, 'yearly');

      expect(repeatTypeSelect).toHaveValue('yearly');
    });

    it('TC-2-5 - 드롭다운에 모든 반복 옵션이 표시된다', async () => {
      renderApp();

      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await userEvent.click(repeatCheckbox);

      await waitFor(() => {
        expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      });

      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      const options = Array.from(repeatTypeSelect.querySelectorAll('option')).map(
        (option) => option.value
      );

      expect(options).toContain('daily');
      expect(options).toContain('weekly');
      expect(options).toContain('monthly');
      expect(options).toContain('yearly');
      expect(options.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Story 3: 반복 일정 생성', () => {
    it('TC-3-1 - 매일 반복 일정이 정상적으로 생성된다', async () => {
      const generatedEvents: Event[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(2024, 0, 1 + i);
        generatedEvents.push({
          id: `daily-${i}`,
          title: '매일 회의',
          date: date.toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '11:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'daily', interval: 1 },
          notificationTime: 10,
        });
      }

      mockFetch.mockImplementation((input) => {
        const method = typeof input === 'string' ? 'GET' : (input as Request).method || 'GET';
        if (method === 'POST') {
          return Promise.resolve(
            new Response(JSON.stringify({ success: true }), {
              status: 201,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
        return Promise.resolve(
          new Response(JSON.stringify({ events: generatedEvents }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      await userEvent.type(screen.getByTestId('title-input'), '매일 회의');
      await userEvent.type(screen.getByTestId('date-input'), '2024-01-01');
      await userEvent.type(screen.getByTestId('start-time-input'), '10:00');
      await userEvent.type(screen.getByTestId('end-time-input'), '11:00');

      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await userEvent.click(repeatCheckbox);

      await waitFor(() => {
        expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      });

      const submitButton = screen.getByTestId('event-submit-button');
      await userEvent.click(submitButton);

      await waitFor(() => {
        const postCall = mockFetch.mock.calls.find((call) => {
          const request = call[0];
          return (
            request &&
            typeof request === 'object' &&
            'url' in request &&
            request.url?.includes('/api/events-list')
          );
        });
        expect(postCall).toBeTruthy();
      });

      // Verify generated events count and type
      await waitFor(() => {
        expect(generatedEvents.length).toBe(7);
        generatedEvents.forEach((event) => {
          expect(event.repeat.type).toBe('daily');
        });
      });
    });

    it('TC-3-2 - 매주 반복 일정이 정상적으로 생성된다', async () => {
      const generatedEvents: Event[] = [];
      for (let i = 0; i < 4; i++) {
        const date = new Date(2024, 0, 1 + i * 7);
        generatedEvents.push({
          id: `weekly-${i}`,
          title: '매주 회의',
          date: date.toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '11:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
        });
      }

      mockFetch.mockImplementation((input) => {
        const method = typeof input === 'string' ? 'GET' : (input as Request).method || 'GET';
        if (method === 'POST') {
          return Promise.resolve(
            new Response(JSON.stringify({ success: true }), {
              status: 201,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
        return Promise.resolve(
          new Response(JSON.stringify({ events: generatedEvents }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      await userEvent.type(screen.getByTestId('title-input'), '매주 회의');
      await userEvent.type(screen.getByTestId('date-input'), '2024-01-01');
      await userEvent.type(screen.getByTestId('start-time-input'), '10:00');
      await userEvent.type(screen.getByTestId('end-time-input'), '11:00');

      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await userEvent.click(repeatCheckbox);

      await waitFor(() => {
        expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      });

      const repeatSelect = screen.getByLabelText('반복 유형');
      await userEvent.selectOptions(repeatSelect, 'weekly');

      const submitButton = screen.getByTestId('event-submit-button');
      await userEvent.click(submitButton);

      await waitFor(() => {
        const postCall = mockFetch.mock.calls.find((call) => {
          const request = call[0];
          return (
            request &&
            typeof request === 'object' &&
            'url' in request &&
            request.url?.includes('/api/events-list')
          );
        });
        expect(postCall).toBeTruthy();
      });

      // Verify generated events count and type
      await waitFor(() => {
        expect(generatedEvents.length).toBe(4);
        generatedEvents.forEach((event) => {
          expect(event.repeat.type).toBe('weekly');
        });
      });
    });

    it('TC-3-3 - 매월 반복 일정이 정상적으로 생성된다', async () => {
      const generatedEvents: Event[] = [];
      for (let i = 0; i < 6; i++) {
        generatedEvents.push({
          id: `monthly-${i}`,
          title: '매월 회의',
          date: `2024-${String(i + 1).padStart(2, '0')}-15`,
          startTime: '10:00',
          endTime: '11:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'monthly', interval: 1 },
          notificationTime: 10,
        });
      }

      mockFetch.mockImplementation((input) => {
        const method = typeof input === 'string' ? 'GET' : (input as Request).method || 'GET';
        if (method === 'POST') {
          return Promise.resolve(
            new Response(JSON.stringify({ success: true }), {
              status: 201,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
        return Promise.resolve(
          new Response(JSON.stringify({ events: generatedEvents }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      await userEvent.type(screen.getByTestId('title-input'), '매월 회의');
      await userEvent.type(screen.getByTestId('date-input'), '2024-01-15');
      await userEvent.type(screen.getByTestId('start-time-input'), '10:00');
      await userEvent.type(screen.getByTestId('end-time-input'), '11:00');

      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await userEvent.click(repeatCheckbox);

      await waitFor(() => {
        expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      });

      const repeatSelect = screen.getByLabelText('반복 유형');
      await userEvent.selectOptions(repeatSelect, 'monthly');

      const submitButton = screen.getByTestId('event-submit-button');
      await userEvent.click(submitButton);

      await waitFor(() => {
        const postCall = mockFetch.mock.calls.find((call) => {
          const request = call[0];
          return (
            request &&
            typeof request === 'object' &&
            'url' in request &&
            request.url?.includes('/api/events-list')
          );
        });
        expect(postCall).toBeTruthy();
      });

      // Verify generated events count and dates
      await waitFor(() => {
        expect(generatedEvents.length).toBe(6);
        generatedEvents.forEach((event) => {
          expect(event.repeat.type).toBe('monthly');
          expect(event.date.endsWith('-15')).toBe(true);
        });
      });
    });

    it('TC-3-4 - 매년 반복 일정이 정상적으로 생성된다', async () => {
      const generatedEvents: Event[] = [];
      for (let i = 0; i < 5; i++) {
        generatedEvents.push({
          id: `yearly-${i}`,
          title: '매년 기념일',
          date: `${2024 + i}-03-15`,
          startTime: '10:00',
          endTime: '11:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'yearly', interval: 1 },
          notificationTime: 10,
        });
      }

      mockFetch.mockImplementation((input) => {
        const method = typeof input === 'string' ? 'GET' : (input as Request).method || 'GET';
        if (method === 'POST') {
          return Promise.resolve(
            new Response(JSON.stringify({ success: true }), {
              status: 201,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
        return Promise.resolve(
          new Response(JSON.stringify({ events: generatedEvents }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      await userEvent.type(screen.getByTestId('title-input'), '매년 기념일');
      await userEvent.type(screen.getByTestId('date-input'), '2024-03-15');
      await userEvent.type(screen.getByTestId('start-time-input'), '10:00');
      await userEvent.type(screen.getByTestId('end-time-input'), '11:00');

      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await userEvent.click(repeatCheckbox);

      await waitFor(() => {
        expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      });

      const repeatSelect = screen.getByLabelText('반복 유형');
      await userEvent.selectOptions(repeatSelect, 'yearly');

      const submitButton = screen.getByTestId('event-submit-button');
      await userEvent.click(submitButton);

      await waitFor(() => {
        const postCall = mockFetch.mock.calls.find((call) => {
          const request = call[0];
          return (
            request &&
            typeof request === 'object' &&
            'url' in request &&
            request.url?.includes('/api/events-list')
          );
        });
        expect(postCall).toBeTruthy();
      });

      // Verify generated events count and dates
      await waitFor(() => {
        expect(generatedEvents.length).toBe(5);
        generatedEvents.forEach((event) => {
          expect(event.repeat.type).toBe('yearly');
          expect(event.date.endsWith('-03-15')).toBe(true);
        });
      });
    });

    it('TC-3-5 - 31일 매월 반복 시 2월에는 생성되지 않는다 (예외)', async () => {
      const monthsWith31Days = [1, 3, 5, 7, 8, 10, 12];
      const generatedEvents: Event[] = monthsWith31Days.map((month, index) => ({
        id: `monthly-31-${index}`,
        title: '31일 회의',
        date: `2024-${String(month).padStart(2, '0')}-31`,
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      }));

      mockFetch.mockImplementation((input) => {
        const method = typeof input === 'string' ? 'GET' : (input as Request).method || 'GET';
        if (method === 'POST') {
          return Promise.resolve(
            new Response(JSON.stringify({ success: true }), {
              status: 201,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
        return Promise.resolve(
          new Response(JSON.stringify({ events: generatedEvents }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      await userEvent.type(screen.getByTestId('title-input'), '31일 회의');
      await userEvent.type(screen.getByTestId('date-input'), '2024-01-31');
      await userEvent.type(screen.getByTestId('start-time-input'), '10:00');
      await userEvent.type(screen.getByTestId('end-time-input'), '11:00');

      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await userEvent.click(repeatCheckbox);

      await waitFor(() => {
        expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      });

      const repeatSelect = screen.getByLabelText('반복 유형');
      await userEvent.selectOptions(repeatSelect, 'monthly');

      const submitButton = screen.getByTestId('event-submit-button');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
        const calls = mockFetch.mock.calls;
        const postCall = calls.find((call) => {
          const request = call[0];
          return (
            request &&
            typeof request === 'object' &&
            'url' in request &&
            request.url?.includes('/api/events-list')
          );
        });
        expect(postCall).toBeDefined();
      });

      await waitFor(() => {
        const hasFebruaryEvent = generatedEvents.some((event) => event.date.includes('-02-'));
        expect(hasFebruaryEvent).toBe(false);
      });
    });

    it('TC-3-6 - 31일 매월 반복 시 30일까지 있는 월에는 생성 안됨', async () => {
      const monthsWith31Days = [1, 3, 5, 7, 8, 10, 12];
      const generatedEvents: Event[] = monthsWith31Days.map((month, index) => ({
        id: `monthly-31-${index}`,
        title: '31일 회의',
        date: `2024-${String(month).padStart(2, '0')}-31`,
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      }));

      mockFetch.mockImplementation((input) => {
        const method = typeof input === 'string' ? 'GET' : (input as Request).method || 'GET';
        if (method === 'POST') {
          return Promise.resolve(
            new Response(JSON.stringify({ success: true }), {
              status: 201,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
        return Promise.resolve(
          new Response(JSON.stringify({ events: generatedEvents }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      await userEvent.type(screen.getByTestId('title-input'), '31일 회의');
      await userEvent.type(screen.getByTestId('date-input'), '2024-01-31');
      await userEvent.type(screen.getByTestId('start-time-input'), '10:00');
      await userEvent.type(screen.getByTestId('end-time-input'), '11:00');

      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await userEvent.click(repeatCheckbox);

      await waitFor(() => {
        expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      });

      const repeatSelect = screen.getByLabelText('반복 유형');
      await userEvent.selectOptions(repeatSelect, 'monthly');

      const submitButton = screen.getByTestId('event-submit-button');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
        const calls = mockFetch.mock.calls;
        const postCall = calls.find((call) => {
          const request = call[0];
          return (
            request &&
            typeof request === 'object' &&
            'url' in request &&
            request.url?.includes('/api/events-list')
          );
        });
        expect(postCall).toBeDefined();
      });

      await waitFor(() => {
        const monthsWith30Days = [4, 6, 9, 11];
        monthsWith30Days.forEach((month) => {
          const has30DayMonthEvent = generatedEvents.some((event) =>
            event.date.includes(`-${String(month).padStart(2, '0')}-`)
          );
          expect(has30DayMonthEvent).toBe(false);
        });
      });
    });

    it('TC-3-7 - 윤년 29일 매년 반복 시 평년에는 생성 안됨 (예외)', async () => {
      const leapYears = [2024, 2028];
      const generatedEvents: Event[] = leapYears.map((year, index) => ({
        id: `yearly-leapday-${index}`,
        title: '윤년 기념일',
        date: `${year}-02-29`,
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'yearly', interval: 1 },
        notificationTime: 10,
      }));

      mockFetch.mockImplementation((input) => {
        const method = typeof input === 'string' ? 'GET' : (input as Request).method || 'GET';
        if (method === 'POST') {
          return Promise.resolve(
            new Response(JSON.stringify({ success: true }), {
              status: 201,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
        return Promise.resolve(
          new Response(JSON.stringify({ events: generatedEvents }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      await userEvent.type(screen.getByTestId('title-input'), '윤년 기념일');
      await userEvent.type(screen.getByTestId('date-input'), '2024-02-29');
      await userEvent.type(screen.getByTestId('start-time-input'), '10:00');
      await userEvent.type(screen.getByTestId('end-time-input'), '11:00');

      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await userEvent.click(repeatCheckbox);

      await waitFor(() => {
        expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      });

      const repeatSelect = screen.getByLabelText('반복 유형');
      await userEvent.selectOptions(repeatSelect, 'yearly');

      const submitButton = screen.getByTestId('event-submit-button');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
        const calls = mockFetch.mock.calls;
        const postCall = calls.find((call) => {
          const request = call[0];
          return (
            request &&
            typeof request === 'object' &&
            'url' in request &&
            request.url?.includes('/api/events-list')
          );
        });
        expect(postCall).toBeDefined();
      });

      await waitFor(() => {
        const nonLeapYears = [2025, 2026, 2027];
        nonLeapYears.forEach((year) => {
          const hasNonLeapYearEvent = generatedEvents.some((event) =>
            event.date.startsWith(`${year}-`)
          );
          expect(hasNonLeapYearEvent).toBe(false);
        });
      });
    });

    it('TC-3-8 - 윤년 29일 매년 반복 시 다음 윤년에는 생성됨', async () => {
      const leapYears = [2024, 2028];
      const generatedEvents: Event[] = leapYears.map((year, index) => ({
        id: `yearly-leapday-${index}`,
        title: '윤년 기념일',
        date: `${year}-02-29`,
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'yearly', interval: 1 },
        notificationTime: 10,
      }));

      mockFetch.mockImplementation((input) => {
        const method = typeof input === 'string' ? 'GET' : (input as Request).method || 'GET';
        if (method === 'POST') {
          return Promise.resolve(
            new Response(JSON.stringify({ success: true }), {
              status: 201,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
        return Promise.resolve(
          new Response(JSON.stringify({ events: generatedEvents }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      await userEvent.type(screen.getByTestId('title-input'), '윤년 기념일');
      await userEvent.type(screen.getByTestId('date-input'), '2024-02-29');
      await userEvent.type(screen.getByTestId('start-time-input'), '10:00');
      await userEvent.type(screen.getByTestId('end-time-input'), '11:00');

      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await userEvent.click(repeatCheckbox);

      await waitFor(() => {
        expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      });

      const repeatSelect = screen.getByLabelText('반복 유형');
      await userEvent.selectOptions(repeatSelect, 'yearly');

      const submitButton = screen.getByTestId('event-submit-button');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
        const calls = mockFetch.mock.calls;
        const postCall = calls.find((call) => {
          const request = call[0];
          return (
            request &&
            typeof request === 'object' &&
            'url' in request &&
            request.url?.includes('/api/events-list')
          );
        });
        expect(postCall).toBeDefined();
      });

      await waitFor(() => {
        const has2028Event = generatedEvents.some((event) => event.date === '2028-02-29');
        expect(has2028Event).toBe(true);
      });
    });
  });
});
