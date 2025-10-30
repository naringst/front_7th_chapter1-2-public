# 🧪 유닛 테스트 설계서: Feature 3 - 반복 일정 종료 조건

## 1. 테스트 목적

반복 일정의 종료 날짜 관련 순수 함수들이 올바르게 동작하는지 검증합니다.
- 종료 날짜 검증 로직의 정확성
- 기본값 및 최대값 처리 로직의 정확성
- 종료 날짜까지 반복 일정 생성 로직의 정확성

## 2. 테스트 범위

### 포함
- `validateRepeatEndDate`: 종료 날짜 검증 함수
- `getRepeatEndDate`: 기본값/최대값 적용 함수
- `generateRecurringEventsUntilEndDate`: 종료 날짜까지 생성 함수

### 제외
- UI 렌더링 로직
- API 호출 로직
- React 컴포넌트 및 훅

## 3. 테스트 분류

| 구분        | 설명                                |
| ----------- | ----------------------------------- |
| 단위 테스트 | 순수 함수의 입력-출력 검증          |
| 통합 테스트 | (제외) UI 및 API 통합은 별도 검증  |

---

## 4. 테스트 시나리오

### 함수 1: `validateRepeatEndDate`

**위치**: `src/utils/repeatValidation.ts` (신규 파일)

**함수 시그니처**:
```typescript
function validateRepeatEndDate(
  startDate: string,
  endDate: string | undefined
): { valid: boolean; error?: string }
```

**테스트 케이스**:

| TC ID | 설명 | 입력 | 기대 결과 | 테스트 유형 |
|-------|------|------|-----------|-------------|
| TC-V-1 | 종료 날짜가 시작 날짜보다 이전이면 invalid | startDate: "2025-10-15"<br>endDate: "2025-10-10" | `{ valid: false, error: "종료 날짜는 시작 날짜 이후여야 합니다" }` | 단위 |
| TC-V-2 | 종료 날짜가 시작 날짜와 같으면 valid | startDate: "2025-10-15"<br>endDate: "2025-10-15" | `{ valid: true }` | 단위 |
| TC-V-3 | 종료 날짜가 시작 날짜보다 이후면 valid | startDate: "2025-10-15"<br>endDate: "2025-10-20" | `{ valid: true }` | 단위 |
| TC-V-4 | 종료 날짜가 undefined면 valid (기본값 적용) | startDate: "2025-10-15"<br>endDate: undefined | `{ valid: true }` | 단위 |
| TC-V-5 | 종료 날짜가 빈 문자열이면 valid (기본값 적용) | startDate: "2025-10-15"<br>endDate: "" | `{ valid: true }` | 단위 |
| TC-V-6 | 잘못된 날짜 형식이면 invalid | startDate: "2025-10-15"<br>endDate: "invalid-date" | `{ valid: false, error: "올바른 날짜 형식이 아닙니다" }` | 단위 |

---

### 함수 2: `getRepeatEndDate`

**위치**: `src/utils/repeatDateUtils.ts`

**함수 시그니처**:
```typescript
function getRepeatEndDate(
  endDate: string | undefined
): string
```

**테스트 케이스**:

| TC ID | 설명 | 입력 | 기대 결과 | 테스트 유형 |
|-------|------|------|-----------|-------------|
| TC-G-1 | undefined면 기본값 반환 | endDate: undefined | `"2025-12-31"` | 단위 |
| TC-G-2 | null이면 기본값 반환 | endDate: null | `"2025-12-31"` | 단위 |
| TC-G-3 | 빈 문자열이면 기본값 반환 | endDate: "" | `"2025-12-31"` | 단위 |
| TC-G-4 | 유효한 날짜면 그대로 반환 | endDate: "2025-10-31" | `"2025-10-31"` | 단위 |
| TC-G-5 | 최대값(2025-12-31)이면 그대로 반환 | endDate: "2025-12-31" | `"2025-12-31"` | 단위 |
| TC-G-6 | 최대값 초과하면 최대값 반환 | endDate: "2026-01-01" | `"2025-12-31"` | 단위 |
| TC-G-7 | 훨씬 미래 날짜도 최대값으로 제한 | endDate: "2027-12-31" | `"2025-12-31"` | 단위 |
| TC-G-8 | 과거 날짜는 그대로 반환 (시작 날짜 검증은 별도) | endDate: "2024-12-31" | `"2024-12-31"` | 단위 |

---

### 함수 3: `generateRecurringEventsUntilEndDate`

**위치**: `src/utils/repeatScheduler.ts` (기존 파일 확장)

**함수 시그니처**:
```typescript
function generateRecurringEventsUntilEndDate(
  baseEvent: Event | EventForm,
  endDate: string
): Event[]
```

**테스트 케이스**:

| TC ID | 설명 | 입력 | 기대 결과 | 테스트 유형 |
|-------|------|------|-----------|-------------|
| TC-R-1 | 매일 반복, 5일간 | startDate: "2025-10-01"<br>repeat: daily<br>endDate: "2025-10-05" | 5개 이벤트 생성<br>날짜: 10/1~10/5 | 단위 |
| TC-R-2 | 매일 반복, 10일간 | startDate: "2025-10-01"<br>repeat: daily<br>endDate: "2025-10-10" | 10개 이벤트<br>마지막: 10/10 | 단위 |
| TC-R-3 | 매주 반복, 1개월 | startDate: "2025-10-01"<br>repeat: weekly<br>endDate: "2025-10-31" | 5개 이벤트<br>(10/1, 10/8, 10/15, 10/22, 10/29) | 단위 |
| TC-R-4 | 매월 반복, 3개월 | startDate: "2025-10-01"<br>repeat: monthly<br>endDate: "2025-12-31" | 3개 이벤트<br>(10/1, 11/1, 12/1) | 단위 |
| TC-R-5 | 연간 반복, 같은 해 | startDate: "2025-10-01"<br>repeat: yearly<br>endDate: "2025-12-31" | 1개 이벤트 (10/1만) | 단위 |
| TC-R-6 | 종료 날짜 = 시작 날짜 | startDate: "2025-10-15"<br>repeat: daily<br>endDate: "2025-10-15" | 1개 이벤트 (10/15만) | 단위 |
| TC-R-7 | 종료 날짜가 첫 반복 전 (경계값) | startDate: "2025-10-01"<br>repeat: weekly<br>endDate: "2025-10-02" | 1개 이벤트 (10/1만) | 단위 |

---

## 5. 테스트 데이터

### Mock Event for Testing
```typescript
const baseEvent: EventForm = {
  title: '테스트 이벤트',
  date: '2025-10-01',
  startTime: '10:00',
  endTime: '11:00',
  description: 'Unit test',
  location: 'Test',
  category: '테스트',
  repeat: {
    type: 'daily', // 테스트마다 변경
    interval: 1,
  },
  notificationTime: 10,
};
```

## 6. 검증 기준 (Assertion Points)

### `validateRepeatEndDate`
- [ ] 날짜 비교 로직이 정확함
- [ ] 에러 메시지가 명확함
- [ ] undefined/null/빈 문자열을 올바르게 처리
- [ ] 잘못된 형식 감지

### `getRepeatEndDate`
- [ ] 기본값(2025-12-31)이 올바르게 적용됨
- [ ] 최대값 제한이 올바르게 동작
- [ ] 유효한 날짜는 변경되지 않음
- [ ] null safety (undefined, null, "" 처리)

### `generateRecurringEventsUntilEndDate`
- [ ] 생성된 이벤트 개수가 정확함
- [ ] 마지막 이벤트 날짜가 endDate 이하
- [ ] endDate + 1일 이벤트는 생성되지 않음
- [ ] 각 반복 유형(daily, weekly, monthly, yearly)이 올바르게 동작
- [ ] 경계값 처리가 정확함

## 7. 엣지 케이스 및 경계값

### `validateRepeatEndDate`
| 케이스 | 입력 | 기대 동작 |
|--------|------|-----------|
| 종료 = 시작 | start: "2025-10-15", end: "2025-10-15" | valid: true |
| 종료 = 시작 - 1일 | start: "2025-10-15", end: "2025-10-14" | valid: false |
| 윤년 날짜 | start: "2024-02-28", end: "2024-02-29" | valid: true |
| 12월 31일 | start: "2025-12-31", end: "2025-12-31" | valid: true |

### `getRepeatEndDate`
| 케이스 | 입력 | 기대 동작 |
|--------|------|-----------|
| 정확히 최대값 | "2025-12-31" | "2025-12-31" |
| 최대값 + 1일 | "2026-01-01" | "2025-12-31" |
| 최대값 - 1일 | "2025-12-30" | "2025-12-30" |
| 과거 날짜 | "2024-01-01" | "2024-01-01" (시작 날짜 검증은 별도) |

### `generateRecurringEventsUntilEndDate`
| 케이스 | 입력 | 기대 동작 |
|--------|------|-----------|
| 종료 = 시작 | start: "2025-10-15", end: "2025-10-15", daily | 1개 |
| 종료 = 시작 + 1일 | start: "2025-10-15", end: "2025-10-16", daily | 2개 |
| 월말 → 다음 달 | start: "2025-10-31", end: "2025-11-30", monthly | 2개 (10/31, 11/30) |
| 윤년 2월 | start: "2024-02-29", end: "2024-03-31", monthly | 2개 (2/29, 3/29) |

## 8. 비고

### 구현 시 고려사항
- 날짜 비교는 `new Date().getTime()` 사용
- 최대값(2025-12-31)은 상수로 정의 (`const MAX_REPEAT_END_DATE = '2025-12-31'`)
- 함수는 순수 함수로 구현 (side effect 없음)
- 타임존 이슈 방지: UTC 또는 로컬 날짜 일관성 유지

### 테스트 코드 구조
```typescript
describe('repeatValidation', () => {
  describe('validateRepeatEndDate', () => {
    it('TC-V-1: 종료 날짜가 시작 날짜보다 이전이면 invalid', () => {
      const result = validateRepeatEndDate('2025-10-15', '2025-10-10');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('종료 날짜는 시작 날짜 이후여야 합니다');
    });
    // ... 더 많은 테스트
  });
});

describe('repeatDateUtils', () => {
  describe('getRepeatEndDate', () => {
    it('TC-G-1: undefined면 기본값 반환', () => {
      const result = getRepeatEndDate(undefined);
      expect(result).toBe('2025-12-31');
    });
    // ... 더 많은 테스트
  });
});

describe('repeatScheduler', () => {
  describe('generateRecurringEventsUntilEndDate', () => {
    it('TC-R-1: 매일 반복, 5일간', () => {
      const events = generateRecurringEventsUntilEndDate(baseEvent, '2025-10-05');
      expect(events).toHaveLength(5);
      expect(events[0].date).toBe('2025-10-01');
      expect(events[4].date).toBe('2025-10-05');
    });
    // ... 더 많은 테스트
  });
});
```

---

**테스트 설계 완료일**: 2025-10-30  
**총 테스트 함수**: 3개  
**총 테스트 케이스**: 21개 (TC-V: 6, TC-G: 8, TC-R: 7)  
**테스트 유형**: 단위 테스트 100%

