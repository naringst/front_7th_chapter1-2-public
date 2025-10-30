# Unit Candidates for "FEATURE2: 반복 일정 표시"

**분석 기준 문서**:

- 통합 테스트 설계: `feature2-test-design.md`
- 통합 테스트 코드: `feature2-integration.spec.tsx`
- 단위 테스트 체크리스트: `/checklists/unit-test.md`

**기능 개요**: 캘린더 뷰와 일정 목록에서 반복 일정을 아이콘으로 시각적으로 구분

---

## 📘 참고 체크리스트 기준

`/checklists/unit-test.md`의 핵심 원칙:

1. **분리할 가치가 있는 로직인가?**

   - [x] 조건/분기 로직이 있다
   - [x] 외부 의존성이 없다 (DOM/React 없이 독립 실행)
   - [x] 입력과 출력이 명확하다

2. **통합 테스트에서 충분히 검증되지 않았는가?**
   - [x] 여러 Flow에서 재사용되는 로직이다
   - [x] 실패 시 사용자 영향이 크다

---

## 🎯 분석 결과

### 통합 테스트에서 식별된 핵심 로직

통합 테스트(feature2-integration.spec.tsx)를 분석한 결과, 다음과 같은 패턴이 반복됩니다:

```typescript
// 반복적으로 나타나는 로직
event.repeat.type !== 'none'; // 반복 일정 판별
```

이 로직은:

- TC-2-1-1, TC-2-1-2 (캘린더 뷰)
- TC-2-2-1 (일정 목록)
- TC-2-3-1, TC-2-3-2 (일관성)

**총 5개의 테스트 케이스에서 암묵적으로 사용**됩니다.

### 체크리스트 검증

| 기준                           | 평가 | 비고                     |
| ------------------------------ | ---- | ------------------------ |
| 조건/분기 로직 있음            | ✅   | `repeat.type !== 'none'` |
| 계산/변환 수행                 | ❌   | 단순 boolean 반환        |
| 외부 의존성 없음               | ✅   | 순수 함수 가능           |
| 입출력 명확                    | ✅   | Event → boolean          |
| 통합 테스트로 내부 동작 불가시 | ✅   | 아이콘 표시 결과만 검증  |
| 여러 Flow에서 재사용           | ✅   | 5개 테스트에서 사용      |
| 실패 시 사용자 영향 큼         | ✅   | 잘못된 아이콘 표시       |

**결론**: 4개 중 3개 충족 → ✅ **단위 테스트 후보**

---

## 1. isRepeatingEvent (Utility)

**Type**: Utility

**Responsibilities**:
이벤트 객체를 받아 반복 일정 여부를 판별하는 순수 함수를 제공한다.

**Methods / Interfaces**:

```typescript
/**
 * 이벤트가 반복 일정인지 확인
 *
 * @param event - 검증할 이벤트 객체
 * @returns 반복 일정이면 true, 일반 일정(none)이면 false
 *
 * @example
 * isRepeatingEvent({ repeat: { type: 'daily' } })   // true
 * isRepeatingEvent({ repeat: { type: 'weekly' } })  // true
 * isRepeatingEvent({ repeat: { type: 'none' } })    // false
 * isRepeatingEvent({})                              // false
 *
 * @throws 없음 - null/undefined 안전
 */
export function isRepeatingEvent(event: Event | EventForm): boolean;
```

**Relations**:

- **사용처**: UI 컴포넌트 (CalendarView, EventList)에서 아이콘 렌더링 조건 판단
- **의존성**: 없음 (완전히 독립적인 순수 함수)

**단위 테스트 케이스 (9개)**:

| Test ID   | Name                   | Input                             | Expected | Category    |
| --------- | ---------------------- | --------------------------------- | -------- | ----------- |
| TC-U2-1-1 | daily 반복 일정 판별   | `{ repeat: { type: 'daily' } }`   | `true`   | 정상        |
| TC-U2-1-2 | weekly 반복 일정 판별  | `{ repeat: { type: 'weekly' } }`  | `true`   | 정상        |
| TC-U2-1-3 | monthly 반복 일정 판별 | `{ repeat: { type: 'monthly' } }` | `true`   | 정상        |
| TC-U2-1-4 | yearly 반복 일정 판별  | `{ repeat: { type: 'yearly' } }`  | `true`   | 정상        |
| TC-U2-1-5 | 일반 일정(none) 판별   | `{ repeat: { type: 'none' } }`    | `false`  | 정상        |
| TC-U2-1-6 | repeat 속성 없음       | `{}`                              | `false`  | 엣지 케이스 |
| TC-U2-1-7 | repeat.type 없음       | `{ repeat: {} }`                  | `false`  | 엣지 케이스 |
| TC-U2-1-8 | null 입력              | `null`                            | `false`  | 엣지 케이스 |
| TC-U2-1-9 | undefined 입력         | `undefined`                       | `false`  | 엣지 케이스 |

**구현 예시**:

```typescript
// src/utils/eventTypeChecker.ts
import type { Event, EventForm } from '../types';

export function isRepeatingEvent(event: Event | EventForm | null | undefined): boolean {
  return event?.repeat?.type !== undefined && event.repeat.type !== 'none';
}
```

**테스트 예시**:

```typescript
// src/__tests__/unit/eventTypeChecker.spec.ts
import { describe, it, expect } from 'vitest';
import { isRepeatingEvent } from '../../utils/eventTypeChecker';

describe('isRepeatingEvent', () => {
  it('TC-U2-1-1: daily 반복 일정을 true로 판별', () => {
    const event = { repeat: { type: 'daily', interval: 1 } };
    expect(isRepeatingEvent(event as any)).toBe(true);
  });

  it('TC-U2-1-5: 일반 일정(none)을 false로 판별', () => {
    const event = { repeat: { type: 'none', interval: 1 } };
    expect(isRepeatingEvent(event as any)).toBe(false);
  });

  it('TC-U2-1-6: repeat 속성 없을 때 false 반환', () => {
    const event = {};
    expect(isRepeatingEvent(event as any)).toBe(false);
  });

  // ... 나머지 6개 테스트
});
```

---

## 🚫 Unit Test 범위에서 제외된 항목

### ❌ React Components (통합 테스트 대상)

**이유**: DOM 의존, 렌더링 로직, props 전달 중심 → 통합 테스트로 충분히 검증

- `CalendarView` - 월간/주간 뷰 렌더링 컴포넌트
- `EventList` - 일정 목록 렌더링 컴포넌트
- `RepeatIcon` - 반복 아이콘 컴포넌트
- `EventItem` - 개별 일정 항목 컴포넌트

**체크리스트 불만족**:

- [x] DOM 의존성 있음
- [x] 입출력이 React Element (명확하지 않음)
- [x] 단순 렌더링, props 전달

### ❌ React Hooks (통합 테스트 대상)

**이유**: React state/lifecycle 의존 → 컴포넌트와 함께 통합 테스트

- `useCalendarView` - 캘린더 뷰 상태 관리
- `useEventList` - 이벤트 목록 상태 관리

**체크리스트 불만족**:

- [x] React 의존성 있음
- [x] 외부 효과(side effect) 포함

### ❌ 추가 Utility 함수 (불필요)

**이유**: 로직이 너무 단순하거나 단순 조합 → 단위 테스트 가치 낮음

#### `getRepeatType` (제외)

```typescript
// ❌ 단순 속성 접근 - 단위 테스트 불필요
function getRepeatType(event: Event): RepeatType {
  return event?.repeat?.type || 'none';
}
```

**제외 이유**:

- 조건/분기 없음 (단순 접근자)
- 계산/변환 없음
- 테스트 가치 < 유지보수 비용

#### `filterRepeatingEvents` (제외)

```typescript
// ❌ 배열 메서드 + 기존 함수 조합 - 단위 테스트 불필요
function filterRepeatingEvents(events: Event[]): Event[] {
  return events.filter(isRepeatingEvent);
}
```

**제외 이유**:

- `isRepeatingEvent` + `Array.filter` 단순 조합
- 고유 로직 없음
- 통합 테스트로 충분

#### `getIconAriaLabel` (제외)

```typescript
// ❌ 상수 반환 - 단위 테스트 불필요
function getIconAriaLabel(): string {
  return '반복 일정';
}
```

**제외 이유**:

- 로직 없음 (상수 반환)
- 테스트로 얻는 가치 없음

### ❌ Type Definitions (타입 체크 영역)

- `Event` - 이벤트 타입 정의
- `EventForm` - 이벤트 폼 타입 정의
- `RepeatType` - 반복 유형 타입 정의

**이유**: TypeScript 컴파일러가 검증

---

## 📊 최종 요약

### 단위 테스트 후보: **1개 (Utility)**

| Name               | Type    | Priority | 테스트 수 | 구현 비용 | 효과                 |
| ------------------ | ------- | -------- | --------- | --------- | -------------------- |
| `isRepeatingEvent` | Utility | 높음     | 9개       | 낮음      | 재사용성 ↑, 안정성 ↑ |

### 의존 관계 다이어그램

```
isRepeatingEvent (Utility - 단위 테스트)
    ↓
[React Components] ← 통합 테스트 영역
    ↓
User Interface
```

### 구현 파일 구조

```
src/
  utils/
    eventTypeChecker.ts              # isRepeatingEvent 구현
  __tests__/
    unit/
      eventTypeChecker.spec.ts       # 단위 테스트 (9개)
```

---

## 💡 권장 사항

### 🟢 구현 권장

**대상**: `isRepeatingEvent` 함수 1개

**우선순위**: 중간 (필수 아님, 권장)

**이유**:

1. ✅ 조건/분기 로직 포함 (체크리스트 기준 충족)
2. ✅ 여러 곳에서 재사용됨 (5개 테스트 케이스)
3. ✅ 실패 시 사용자 영향 큼 (잘못된 아이콘 표시)
4. ✅ 순수 함수로 테스트 작성 매우 간단
5. ✅ 구현 비용 낮음 (함수 1개, 테스트 9개)

**효과**:

- 코드 재사용성 향상
- 통합 테스트 + 단위 테스트 이중 검증
- 리팩터링 시 안전망 제공
- 다른 Feature에서도 재사용 가능

### 🟡 추가 구현 불필요

**대상**: `getRepeatType`, `filterRepeatingEvents`, `getIconAriaLabel`

**이유**:

- 로직이 너무 단순 (단순 접근자, 배열 메서드 조합, 상수 반환)
- 테스트 가치 < 유지보수 비용
- 통합 테스트로 충분히 검증됨

**조건부 추가**: 아래 조건 충족 시에만 고려

- [ ] 로직이 복잡해짐
- [ ] 다른 Feature에서도 필요
- [ ] 성능 최적화 필요

---

## 🔍 Feature2의 특수성

### UI 중심 기능의 단위 테스트 범위

Feature2는 **시각적 표시 중심 기능**으로:

- 복잡한 비즈니스 로직 거의 없음
- 대부분 React 컴포넌트 렌더링
- **통합 테스트 93점(Excellent)**으로 충분히 검증됨

### 단위 테스트의 역할

이런 UI 중심 기능에서 단위 테스트는:

- ✅ **핵심 판별 로직 추출** → 재사용성 확보
- ✅ **경계 조건 명확히 검증** → 엣지 케이스 커버
- ❌ 모든 로직을 단위로 쪼개지 않음 → 과도한 추출 방지

### 체크리스트 기준 적용

`/checklists/unit-test.md` 기준:

> "입력과 출력이 명확하고, 통합 테스트로 내부 동작이 보이지 않는 로직은 단위로 뽑아라."

**Feature2 적용**:

- ✅ `isRepeatingEvent`: 입출력 명확, 통합 테스트가 "아이콘 표시" 결과만 검증
- ❌ 나머지: 너무 단순하거나 통합 테스트로 충분

---

## ✅ 결론

### 단위 테스트 후보: 1개

**`isRepeatingEvent` (Utility)**

- Type: 순수 함수
- 테스트 케이스: 9개
- 구현 비용: 낮음
- 효과: 재사용성 ↑, 안정성 ↑

### 제외된 항목

- **React Components/Hooks**: 통합 테스트 영역 (7개)
- **추가 Utility**: 로직 너무 단순 (3개)
- **Type Definitions**: TypeScript 영역 (3개)

### 권장 사항

1. **우선 구현**: `isRepeatingEvent` 1개 구현
2. **통합 테스트 유지**: 현재 93점 유지 (매우 우수)
3. **점진적 추가**: 필요 시 추가 Utility 고려

---

**작성 기준**: `/checklists/unit-test.md`  
**작성일**: 2025-10-30  
**통합 테스트 품질**: 93/100 (Excellent)
