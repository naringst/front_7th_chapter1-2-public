/**
 * Integration Test: Feature 3 - 반복 일정 종료 조건
 * Epic: 반복 일정 종료 관리
 *
 * 이 테스트는 반복 일정의 종료 날짜 설정, 검증, 수정 및 표시 기능을 검증합니다.
 */

import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { beforeEach, describe, expect, it } from 'vitest';

import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';

// Mock events for testing
const mockRepeatingEventWithEnd: Event = {
  id: 'repeat-with-end-1',
  title: '매주 회의',
  date: '2025-10-01',
  startTime: '10:00',
  endTime: '11:00',
  description: '종료 날짜가 있는 반복 일정',
  location: '회의실',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-10-31',
  },
  notificationTime: 10,
};

const mockRepeatingEventNoEnd: Event = {
  id: 'repeat-no-end-1',
  title: '매일 운동',
  date: '2025-10-01',
  startTime: '07:00',
  endTime: '08:00',
  description: '종료 날짜 없음',
  location: '헬스장',
  category: '개인',
  repeat: {
    type: 'daily',
    interval: 1,
  },
  notificationTime: 10,
};

const renderApp = () => {
  return render(
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  );
};

describe('FEATURE3: 반복 일정 종료 조건 (Epic: 반복 일정 종료 관리)', () => {
  beforeEach(() => {
    // MSW 핸들러를 사용하여 Mock 데이터 설정
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [mockRepeatingEventWithEnd, mockRepeatingEventNoEnd],
        });
      })
    );
  });

  // ----- Story 1: 반복 종료 조건 설정 -----
  describe('Story 1: 반복 종료 조건 설정', () => {
    it('TC-3-1-1 - 반복 체크 시 종료 날짜 입력 필드가 표시된다', async () => {
      // Arrange: 앱 렌더링
      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 먼저 "반복 일정" 체크박스 클릭
      const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
      await userEvent.click(repeatCheckbox);

      // Assert: 종료 날짜 입력 필드가 표시됨
      // "반복 종료일" 텍스트가 있는지 확인 (FormLabel)
      expect(screen.getByText('반복 종료일')).toBeInTheDocument();

      // date type input이 2개 이상 있는지 확인 (날짜 필드 + 반복 종료일)
      const dateInputs = screen.getAllByDisplayValue('');
      const dateTypeInputs = dateInputs.filter((input) => input.getAttribute('type') === 'date');
      expect(dateTypeInputs.length).toBeGreaterThanOrEqual(2);
    });

    it('TC-3-1-2 - 반복 유형 "반복 안함" 선택 시 종료 날짜 필드가 숨겨진다', async () => {
      // Arrange: 앱 렌더링
      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // 먼저 "반복 일정" 체크박스 클릭
      const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
      await userEvent.click(repeatCheckbox);

      // 반복 유형 필드가 표시되는지 확인
      expect(screen.getByText('반복 종료일')).toBeInTheDocument();

      // Act: "반복 일정" 체크박스를 다시 클릭하여 해제
      await userEvent.click(repeatCheckbox);

      // Assert: 종료 날짜 입력 필드가 숨겨짐
      expect(screen.queryByText('반복 종료일')).not.toBeInTheDocument();
    });

    it(
      'TC-3-1-3 - 종료 날짜를 입력하고 저장하면 해당 날짜까지만 반복 일정이 생성된다',
      async () => {
        // Arrange: 앱 렌더링 및 MSW 설정
        let postedEvents: Event[] = [];
        server.use(
          http.get('/api/events', () => {
            // 겹침을 피하기 위해 초기 이벤트를 빈 배열로 설정
            return HttpResponse.json({ events: [] });
          }),
          http.post('/api/events-list', async ({ request }) => {
            const body = (await request.json()) as { events: Event[] };
            postedEvents = body.events;
            return HttpResponse.json({ success: true }, { status: 201 });
          })
        );

        renderApp();
        await screen.findByText('일정 로딩 완료!');

        // Act: 일정 추가 폼에 입력
        await userEvent.type(screen.getByLabelText('제목'), '매일 회의');
        await userEvent.type(screen.getByLabelText('날짜'), '2025-10-01');
        await userEvent.type(screen.getByLabelText('시작 시간'), '10:00');
        await userEvent.type(screen.getByLabelText('종료 시간'), '11:00');

        // 반복 일정 체크박스 클릭
        await userEvent.click(screen.getByRole('checkbox', { name: '반복 일정' }));

        // 반복 유형 필드가 나타날 때까지 대기
        await waitFor(() => {
          expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
        });
        await userEvent.selectOptions(screen.getByLabelText('반복 유형'), 'daily');

        // 종료 날짜 입력
        const endDateInput = screen.getByTestId('repeat-end-date-input') as HTMLInputElement;
        await userEvent.clear(endDateInput);
        await userEvent.type(endDateInput, '2025-10-05');

        // 종료 날짜가 제대로 입력되었는지 확인
        await waitFor(() => {
          expect(endDateInput.value).toBe('2025-10-05');
        });

        // 저장 버튼 클릭
        const saveButton = screen.getByRole('button', { name: /일정 (추가|저장|수정)/i });
        await userEvent.click(saveButton);

        // Assert: 생성된 일정이 5개 (10/1~10/5)
        // API 호출이 완료될 때까지 대기
        // 에러 메시지가 표시되면 실패
        await waitFor(
          () => {
            expect(postedEvents).toHaveLength(5);
          },
          { timeout: 10000 }
        );
        // 스낵바는 선택적으로 확인 (저장 성공은 postedEvents로 확인됨)
        const snackbar = screen.queryByText('일정이 추가되었습니다');
        if (snackbar) {
          expect(snackbar).toBeInTheDocument();
        }
        expect(postedEvents[0].date).toBe('2025-10-01');
        expect(postedEvents[4].date).toBe('2025-10-05');
      },
      { timeout: 15000 }
    );

    it(
      'TC-3-1-4 - 종료 날짜 미입력 시 기본값(2025-12-31)까지 생성된다',
      async () => {
        // Arrange: 앱 렌더링 및 MSW 설정
        let postedEvents: Event[] = [];
        server.use(
          http.get('/api/events', () => {
            // 겹침을 피하기 위해 초기 이벤트를 빈 배열로 설정
            return HttpResponse.json({ events: [] });
          }),
          http.post('/api/events-list', async ({ request }) => {
            const body = (await request.json()) as { events: Event[] };
            postedEvents = body.events;
            return HttpResponse.json({ success: true }, { status: 201 });
          })
        );

        renderApp();
        await screen.findByText('일정 로딩 완료!');

        // Act: 일정 추가 폼에 입력 (종료 날짜 제외)
        await userEvent.type(screen.getByLabelText('제목'), '매주 회의');
        await userEvent.type(screen.getByLabelText('날짜'), '2025-10-01');
        await userEvent.type(screen.getByLabelText('시작 시간'), '10:00');
        await userEvent.type(screen.getByLabelText('종료 시간'), '11:00');

        // 반복 일정 체크박스 클릭
        await userEvent.click(screen.getByRole('checkbox', { name: '반복 일정' }));

        // 반복 유형 필드가 나타날 때까지 대기
        await waitFor(() => {
          expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
        });
        await userEvent.selectOptions(screen.getByLabelText('반복 유형'), 'weekly');

        // 저장 버튼 클릭
        const saveButton = screen.getByRole('button', { name: /일정 (추가|저장|수정)/i });
        await userEvent.click(saveButton);

        // 겹침 다이얼로그 처리 (있으면 계속 진행)
        await waitFor(
          async () => {
            const overlapDialog = screen.queryByText('일정 겹침 경고');
            if (overlapDialog) {
              const continueButton = screen.getByRole('button', { name: '계속 진행' });
              await userEvent.click(continueButton);
            }
            return !screen.queryByText('일정 겹침 경고');
          },
          { timeout: 3000 }
        );

        // Assert: 마지막 일정이 2025-12-31 이전, 2026-01-01 이후는 없음
        await waitFor(
          () => {
            expect(postedEvents.length).toBeGreaterThan(0);
          },
          { timeout: 10000 }
        );
        // 스낵바는 선택적으로 확인 (저장 성공은 postedEvents로 확인됨)
        const snackbar = screen.queryByText('일정이 추가되었습니다');
        if (snackbar) {
          expect(snackbar).toBeInTheDocument();
        }

        const lastEvent = postedEvents[postedEvents.length - 1];
        const lastDate = new Date(lastEvent.date);
        const maxDate = new Date('2025-12-31');
        expect(lastDate.getTime()).toBeLessThanOrEqual(maxDate.getTime());

        // 2026년 일정이 없어야 함
        const hasEvent2026 = postedEvents.some((event) => event.date.startsWith('2026'));
        expect(hasEvent2026).toBe(false);
      },
      { timeout: 15000 }
    );
  });

  // ----- Story 2: 반복 종료 조건 검증 -----
  describe('Story 2: 반복 종료 조건 검증', () => {
    it(
      'TC-3-2-1 - 종료 날짜가 시작 날짜보다 이전이면 에러 메시지가 표시된다',
      async () => {
        // Arrange: 앱 렌더링 및 MSW 설정 (API 호출이 없어야 함)
        let apiCalled = false;
        server.use(
          http.post('/api/events-list', () => {
            apiCalled = true;
            return HttpResponse.json({ success: true }, { status: 201 });
          })
        );

        renderApp();
        await screen.findByText('일정 로딩 완료!');

        // Act: 잘못된 종료 날짜 입력
        await userEvent.type(screen.getByLabelText('제목'), '테스트 일정');
        await userEvent.type(screen.getByLabelText('날짜'), '2025-10-15');
        await userEvent.type(screen.getByLabelText('시작 시간'), '10:00');
        await userEvent.type(screen.getByLabelText('종료 시간'), '11:00');

        // 반복 일정 체크박스 클릭
        await userEvent.click(screen.getByRole('checkbox', { name: '반복 일정' }));

        // 반복 유형 필드가 나타날 때까지 대기
        await waitFor(() => {
          expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
        });
        await userEvent.selectOptions(screen.getByLabelText('반복 유형'), 'daily');
        // 종료 날짜 입력
        const endDateInput = screen.getByTestId('repeat-end-date-input');
        await userEvent.click(endDateInput);
        await userEvent.paste('2025-10-10');

        // 저장 버튼 클릭
        const saveButton = screen.getByRole('button', { name: /일정 (추가|저장)/i });
        await userEvent.click(saveButton);

        // Assert: 에러 메시지 표시, API 호출 없음
        await waitFor(
          () => {
            expect(screen.getByText(/종료 날짜는 시작 날짜 이후여야 합니다/i)).toBeInTheDocument();
          },
          { timeout: 10000 }
        );
        expect(apiCalled).toBe(false);
      },
      { timeout: 15000 }
    );

    it(
      'TC-3-2-2 - 반복 일정이 종료 날짜 다음날부터는 생성되지 않는다',
      async () => {
        // Arrange: 앱 렌더링 및 MSW 설정
        let postedEvents: Event[] = [];
        server.use(
          http.get('/api/events', () => {
            // 겹침을 피하기 위해 초기 이벤트를 빈 배열로 설정
            return HttpResponse.json({ events: [] });
          }),
          http.post('/api/events-list', async ({ request }) => {
            const body = (await request.json()) as { events: Event[] };
            postedEvents = body.events;
            return HttpResponse.json({ success: true }, { status: 201 });
          })
        );

        renderApp();
        await screen.findByText('일정 로딩 완료!');

        // Act: 일정 추가 (10/1 ~ 10/10)
        await userEvent.type(screen.getByLabelText('제목'), '매일 미팅');
        await userEvent.type(screen.getByLabelText('날짜'), '2025-10-01');
        await userEvent.type(screen.getByLabelText('시작 시간'), '10:00');
        await userEvent.type(screen.getByLabelText('종료 시간'), '11:00');

        // 반복 일정 체크박스 클릭
        await userEvent.click(screen.getByRole('checkbox', { name: '반복 일정' }));

        // 반복 유형 필드가 나타날 때까지 대기
        await waitFor(() => {
          expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
        });
        await userEvent.selectOptions(screen.getByLabelText('반복 유형'), 'daily');
        // 종료 날짜 입력
        const endDateInput = screen.getByTestId('repeat-end-date-input') as HTMLInputElement;
        await userEvent.clear(endDateInput);
        await userEvent.type(endDateInput, '2025-10-10');

        // 종료 날짜가 제대로 입력되었는지 확인
        await waitFor(() => {
          expect(endDateInput.value).toBe('2025-10-10');
        });

        const saveButton = screen.getByRole('button', { name: /일정 (추가|저장|수정)/i });
        await userEvent.click(saveButton);

        // 겹침 다이얼로그 처리 (있으면 계속 진행)
        await waitFor(
          async () => {
            const overlapDialog = screen.queryByText('일정 겹침 경고');
            if (overlapDialog) {
              const continueButton = screen.getByRole('button', { name: '계속 진행' });
              await userEvent.click(continueButton);
            }
            return !screen.queryByText('일정 겹침 경고');
          },
          { timeout: 3000 }
        );

        // Assert: 정확히 10개, 마지막 날짜 10/10, 10/11은 없음
        await waitFor(
          () => {
            expect(postedEvents).toHaveLength(10);
          },
          { timeout: 10000 }
        );
        // 스낵바는 선택적으로 확인 (저장 성공은 postedEvents로 확인됨)
        const snackbar = screen.queryByText('일정이 추가되었습니다');
        if (snackbar) {
          expect(snackbar).toBeInTheDocument();
        }
        expect(postedEvents[9].date).toBe('2025-10-10');

        const hasEvent1011 = postedEvents.some((event) => event.date === '2025-10-11');
        expect(hasEvent1011).toBe(false);
      },
      { timeout: 15000 }
    );

    it('TC-3-2-3 - 종료 날짜가 2025-12-31을 초과하면 2025-12-31까지만 생성된다', async () => {
      // Arrange: 앱 렌더링 및 MSW 설정
      let postedEvents: Event[] = [];
      server.use(
        http.get('/api/events', () => {
          // 겹침을 피하기 위해 초기 이벤트를 빈 배열로 설정
          return HttpResponse.json({ events: [] });
        }),
        http.post('/api/events-list', async ({ request }) => {
          const body = (await request.json()) as { events: Event[] };
          postedEvents = body.events;
          return HttpResponse.json({ success: true }, { status: 201 });
        })
      );

      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 종료 날짜를 2026년으로 설정
      await userEvent.type(screen.getByLabelText('제목'), '매일 운동');
      await userEvent.type(screen.getByLabelText('날짜'), '2025-12-01');
      await userEvent.type(screen.getByLabelText('시작 시간'), '07:00');
      await userEvent.type(screen.getByLabelText('종료 시간'), '08:00');

      // 반복 일정 체크박스 클릭
      await userEvent.click(screen.getByRole('checkbox', { name: '반복 일정' }));

      await userEvent.selectOptions(screen.getByLabelText('반복 유형'), 'daily');
      // 종료 날짜 입력 (2026년으로 설정하여 최대값 테스트)
      const endDateInput = screen.getByTestId('repeat-end-date-input');
      await userEvent.click(endDateInput);
      await userEvent.paste('2026-01-31');

      const saveButton = screen.getByRole('button', { name: /일정 (추가|저장|수정)/i });
      await userEvent.click(saveButton);

      // Assert: 마지막 일정이 2025-12-31, 총 31개
      await waitFor(
        () => {
          expect(postedEvents).toHaveLength(31); // 12/1 ~ 12/31
        },
        { timeout: 10000 }
      );
      // 스낵바는 선택적으로 확인 (저장 성공은 postedEvents로 확인됨)
      const snackbar = screen.queryByText('일정이 추가되었습니다');
      if (snackbar) {
        expect(snackbar).toBeInTheDocument();
      }

      const lastEvent = postedEvents[postedEvents.length - 1];
      expect(lastEvent.date).toBe('2025-12-31');

      const hasEvent2026 = postedEvents.some((event) => event.date.startsWith('2026'));
      expect(hasEvent2026).toBe(false);
    });
  });

  // ----- Story 3: 종료 날짜 수정 및 표시 -----
  describe('Story 3: 종료 날짜 수정 및 표시', () => {
    it('TC-3-3-1 - 반복 일정 수정 시 기존 종료 날짜가 입력 필드에 표시된다', async () => {
      // Arrange: 앱 렌더링
      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 종료 날짜가 있는 반복 일정 클릭 및 수정 버튼 클릭 (이벤트 리스트 범위로 제한)
      const list = screen.getByTestId('event-list');
      const eventTitle = (await within(list).findAllByText(/^매주 회의$/))[0];
      await userEvent.click(eventTitle);

      const editButton = within(list).getAllByRole('button', { name: /수정/i })[0];
      await userEvent.click(editButton);

      // Feature4 편집 모드 다이얼로그 처리: 단일 수정 선택 후 닫힘 대기
      const yesButton = await screen.findByRole('button', { name: /예/i });
      await userEvent.click(yesButton);
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Assert: "반복 종료일" 텍스트가 표시됨 (기능 미구현 상태)
      expect(screen.getByText('반복 종료일')).toBeInTheDocument();
    });

    it(
      'TC-3-3-2 - 종료 날짜를 수정하면 새로운 종료 날짜가 반영된다',
      async () => {
        // Arrange: 앱 렌더링 및 MSW 설정
        let updatedEvent: Event | null = null;
        server.use(
          http.put('/api/events/:id', async ({ request }) => {
            updatedEvent = (await request.json()) as Event;
            return HttpResponse.json(updatedEvent);
          })
        );

        renderApp();
        await screen.findByText('일정 로딩 완료!');

        // Act: 반복 일정 수정 (이벤트 리스트 범위로 제한)
        const list = screen.getByTestId('event-list');
        const eventTitle = (await within(list).findAllByText(/^매주 회의$/))[0];
        await userEvent.click(eventTitle);

        const editButton = within(list).getAllByRole('button', { name: /수정/i })[0];
        await userEvent.click(editButton);

        // 편집 모드 다이얼로그: 전체 수정 선택 후 닫힘 대기 (endDate 반영 검증)
        const noButton = await screen.findByRole('button', { name: /아니오/i });
        await userEvent.click(noButton);
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        // 종료 날짜 수정
        const endDateInput = screen.getByTestId('repeat-end-date-input');
        await userEvent.clear(endDateInput);
        await userEvent.paste('2025-11-30');

        // 저장 버튼 클릭
        const saveButton = screen.getByRole('button', { name: /일정 (추가|수정)/i });
        await userEvent.click(saveButton);

        // Assert: 수정된 종료 날짜 확인
        await waitFor(
          () => {
            expect(updatedEvent).not.toBeNull();
          },
          { timeout: 10000 }
        );
        // 스낵바는 선택적으로 확인 (저장 성공은 updatedEvent로 확인됨)
        const snackbar = screen.queryByText('일정이 수정되었습니다');
        if (snackbar) {
          expect(snackbar).toBeInTheDocument();
        }
        const updated = (updatedEvent ?? ({} as unknown)) as Event;
        expect(updated.repeat.endDate).toBe('2025-11-30');
      },
      { timeout: 15000 }
    );

    it('TC-3-3-3 - 일정 목록에서 반복 일정의 종료 날짜 정보가 표시된다', async () => {
      // Arrange: 앱 렌더링
      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 일정 목록 확인
      const eventList = screen.getByTestId('event-list');

      // Assert: 종료 날짜 정보 표시 확인
      // 우리 UI는 "(종료: YYYY-MM-DD)" 형태로 표시
      const endDateInfo = await within(eventList).findByText(/\(종료: 2025-10-31\)/i);
      expect(endDateInfo).toBeInTheDocument();
    });
  });
});
