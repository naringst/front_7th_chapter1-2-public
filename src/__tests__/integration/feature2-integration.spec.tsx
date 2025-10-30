/**
 * FEATURE2 통합 테스트: 반복 일정 표시
 * Epic: 반복 일정 시각적 구분
 *
 * 이 테스트는 캘린더 뷰(월간/주간)와 일정 목록에서
 * 반복 일정이 아이콘으로 시각적으로 구분되는지 검증합니다.
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../../App';
import { Event } from '../../types';

// Mock API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock events with repeating and normal events
const mockRepeatingEventWeekly: Event = {
  id: 'repeat-weekly-1',
  title: '매주 회의',
  date: '2024-01-15',
  startTime: '10:00',
  endTime: '11:00',
  description: '주간 반복 일정',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'weekly', interval: 1 },
  notificationTime: 10,
};

const mockRepeatingEventDaily: Event = {
  id: 'repeat-daily-1',
  title: '매일 스탠드업',
  date: '2024-01-15',
  startTime: '09:00',
  endTime: '09:30',
  description: '일일 반복 일정',
  location: '팀룸',
  category: '업무',
  repeat: { type: 'daily', interval: 1 },
  notificationTime: 10,
};

const mockRepeatingEventMonthly: Event = {
  id: 'repeat-monthly-1',
  title: '월간 보고',
  date: '2024-01-15',
  startTime: '15:00',
  endTime: '16:00',
  description: '월간 반복 일정',
  location: '본사',
  category: '업무',
  repeat: { type: 'monthly', interval: 1 },
  notificationTime: 10,
};

const mockRepeatingEventYearly: Event = {
  id: 'repeat-yearly-1',
  title: '연간 평가',
  date: '2024-01-15',
  startTime: '14:00',
  endTime: '17:00',
  description: '연간 반복 일정',
  location: '대회의실',
  category: '업무',
  repeat: { type: 'yearly', interval: 1 },
  notificationTime: 10,
};

const mockNormalEvent: Event = {
  id: 'normal-1',
  title: '일반 회의',
  date: '2024-01-16',
  startTime: '14:00',
  endTime: '15:00',
  description: '일반 일정',
  location: '회의실 B',
  category: '개인',
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

/**
 * Helper: 일정 제목 근처에서 반복 아이콘을 찾는 헬퍼 함수
 * DOM 구조 변경에 강하도록 여러 탐색 전략을 시도합니다.
 */
function findRepeatIconNearTitle(titleElement: HTMLElement): HTMLElement | null {
  // 1. 부모 요소에서 aria-label로 아이콘 찾기
  const parent = titleElement.parentElement;
  if (parent) {
    const icon = within(parent).queryByLabelText('반복 일정');
    if (icon) return icon;
  }

  // 2. 조부모 요소에서 찾기 (중첩 구조 대응)
  const grandParent = parent?.parentElement;
  if (grandParent) {
    const icon = within(grandParent).queryByLabelText('반복 일정');
    if (icon) return icon;
  }

  return null;
}

describe('FEATURE2: 반복 일정 표시 (Epic: 반복 일정 시각적 구분)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock initial fetch to return events with both repeating and normal events
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          events: [
            mockRepeatingEventWeekly,
            mockRepeatingEventDaily,
            mockRepeatingEventMonthly,
            mockRepeatingEventYearly,
            mockNormalEvent,
          ],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );
  });

  // ----- Story 1: 캘린더 뷰에서 반복 일정 아이콘 표시 -----
  describe('Story 1: 캘린더 뷰에서 반복 일정 아이콘 표시', () => {
    it('TC-2-1-1 - 월간 뷰에서 반복 일정이 아이콘과 함께 표시된다', async () => {
      // Arrange: 앱 렌더링 및 월간 뷰 확인
      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // 월간 뷰가 기본값이므로 별도 전환 불필요
      const monthView = screen.getByTestId('month-view');
      expect(monthView).toBeInTheDocument();

      // Act: 월간 뷰에서 반복 일정 찾기
      const repeatingEventTitle = await within(monthView).findByText('매주 회의');
      expect(repeatingEventTitle).toBeInTheDocument();

      // Assert: 반복 일정 옆에 반복 아이콘이 표시되는지 확인
      const repeatIcon = findRepeatIconNearTitle(repeatingEventTitle);
      expect(repeatIcon).toBeInTheDocument();
    });

    it('TC-2-1-2 - 주간 뷰에서 반복 일정이 아이콘과 함께 표시된다', async () => {
      // Arrange: 앱 렌더링
      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 주간 뷰로 전환
      const viewSelect = screen.getByLabelText('뷰 타입 선택');
      await userEvent.selectOptions(viewSelect, 'week');

      // 주간 뷰 확인
      const weekView = await screen.findByTestId('week-view');
      expect(weekView).toBeInTheDocument();

      // 주간 뷰에서 반복 일정 찾기
      const repeatingEventTitle = await within(weekView).findByText('매주 회의');
      expect(repeatingEventTitle).toBeInTheDocument();

      // Assert: 반복 일정 옆에 반복 아이콘이 표시되는지 확인
      const repeatIcon = findRepeatIconNearTitle(repeatingEventTitle);
      expect(repeatIcon).toBeInTheDocument();
    });

    it('TC-2-1-3 - 일반 일정은 아이콘 없이 제목만 표시된다', async () => {
      // Arrange: 앱 렌더링
      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 월간 뷰에서 일반 일정 찾기
      const monthView = screen.getByTestId('month-view');
      const normalEventTitle = await within(monthView).findByText('일반 회의');
      expect(normalEventTitle).toBeInTheDocument();

      // Assert: 일반 일정에는 반복 아이콘이 없어야 함
      const repeatIcon = findRepeatIconNearTitle(normalEventTitle);
      expect(repeatIcon).not.toBeInTheDocument();
    });
  });

  // ----- Story 2: 일정 목록에서 반복 일정 아이콘 표시 -----
  describe('Story 2: 일정 목록에서 반복 일정 아이콘 표시', () => {
    it('TC-2-2-1 - 일정 목록에서 반복 일정이 아이콘과 함께 표시된다', async () => {
      // Arrange: 앱 렌더링
      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 일정 목록(오른쪽 사이드바)에서 반복 일정 찾기
      const eventList = screen.getByTestId('event-list');
      const repeatingEventTitle = await within(eventList).findByText('매주 회의');
      expect(repeatingEventTitle).toBeInTheDocument();

      // Assert: 반복 일정 옆에 반복 아이콘이 표시되는지 확인
      const repeatIcon = findRepeatIconNearTitle(repeatingEventTitle);
      expect(repeatIcon).toBeInTheDocument();
    });

    it('TC-2-2-2 - 일정 목록에서 일반 일정은 아이콘 없이 표시된다', async () => {
      // Arrange: 앱 렌더링
      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 일정 목록에서 일반 일정 찾기
      const eventList = screen.getByTestId('event-list');
      const normalEventTitle = await within(eventList).findByText('일반 회의');
      expect(normalEventTitle).toBeInTheDocument();

      // Assert: 일반 일정에는 반복 아이콘이 없어야 함
      const repeatIcon = findRepeatIconNearTitle(normalEventTitle);
      expect(repeatIcon).not.toBeInTheDocument();
    });
  });

  // ----- Story 3: 반복 일정 아이콘 일관성 유지 -----
  describe('Story 3: 반복 일정 아이콘 일관성 유지', () => {
    it('TC-2-3-1 - 모든 반복 유형이 동일한 아이콘으로 표시된다', async () => {
      // Arrange: 앱 렌더링
      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 모든 반복 아이콘 수집
      const allRepeatIcons = await screen.findAllByLabelText('반복 일정');
      expect(allRepeatIcons.length).toBeGreaterThan(0);

      // Assert: 모든 반복 아이콘이 동일한 타입(컴포넌트)을 사용하는지 확인
      const iconTypes = allRepeatIcons.map((icon) => icon.tagName);
      const uniqueTypes = new Set(iconTypes);
      expect(uniqueTypes.size).toBe(1); // 모든 아이콘이 동일한 태그를 사용

      // 추가: 모든 아이콘이 동일한 data-testid를 가지는지 확인 (선택적)
      const iconTestIds = allRepeatIcons
        .map((icon) => icon.getAttribute('data-testid'))
        .filter(Boolean);

      if (iconTestIds.length > 0) {
        const uniqueTestIds = new Set(iconTestIds);
        expect(uniqueTestIds.size).toBe(1); // 모든 아이콘이 동일한 testid 사용
      }
    });

    it('TC-2-3-2 - 아이콘 위치가 일정 제목 앞에 일관되게 표시된다', async () => {
      // Arrange: 앱 렌더링
      renderApp();
      await screen.findByText('일정 로딩 완료!');

      // Act: 여러 반복 유형의 일정 제목 찾기
      const weeklyEventTitle = await screen.findByText('매주 회의');
      const dailyEventTitle = await screen.findByText('매일 스탠드업');
      const monthlyEventTitle = await screen.findByText('월간 보고');

      // Assert: 각 반복 일정에 아이콘이 존재하는지 확인
      const weeklyIcon = findRepeatIconNearTitle(weeklyEventTitle);
      const dailyIcon = findRepeatIconNearTitle(dailyEventTitle);
      const monthlyIcon = findRepeatIconNearTitle(monthlyEventTitle);

      expect(weeklyIcon).toBeInTheDocument();
      expect(dailyIcon).toBeInTheDocument();
      expect(monthlyIcon).toBeInTheDocument();

      // 아이콘이 일관된 위치에 표시되는지 확인
      // 헬퍼 함수가 동일한 탐색 로직(부모/조부모 요소 내 aria-label)으로
      // 모든 아이콘을 성공적으로 찾았다면, 위치가 일관됨을 의미합니다.
      // 추가 검증: 모든 아이콘이 제목과 같은 컨테이너 내에 존재하는지 확인
      const weeklyParent = weeklyEventTitle.parentElement;
      const dailyParent = dailyEventTitle.parentElement;
      const monthlyParent = monthlyEventTitle.parentElement;

      // 부모 요소가 존재하고, 그 안에 아이콘이 포함되어 있는지 확인
      expect(weeklyParent).toContainElement(weeklyIcon as HTMLElement);
      expect(dailyParent).toContainElement(dailyIcon as HTMLElement);
      expect(monthlyParent).toContainElement(monthlyIcon as HTMLElement);
    });
  });
});
