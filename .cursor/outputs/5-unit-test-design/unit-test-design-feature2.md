# 🧪 단위 테스트 설계서 - FEATURE2: 반복 일정 표시

**기능 개요**: 캘린더 뷰와 일정 목록에서 반복 일정을 아이콘으로 시각적으로 구분

**참조 문서**:

- 통합 테스트 설계: `feature2-test-design.md`
- 통합 테스트 코드: `feature2-integration.spec.tsx`
- 단위 후보 분석: `feature2-breakdown-test-design.md`

---

## 1. 테스트 목적

**핵심 판별 로직의 정확성 보장**

- 이벤트가 반복 일정인지 일반 일정인지 정확히 판별
- 다양한 반복 유형(daily, weekly, monthly, yearly, none)을 올바르게 구분
- 엣지 케이스(null, undefined, 불완전한 객체)를 안전하게 처리

**재사용성 및 안정성 확보**

- 여러 UI 컴포넌트에서 재사용 가능한 순수 함수 제공
- 통합 테스트와 이중 검증으로 안정성 극대화
- 리팩터링 시 안전망 역할

---

## 2. 테스트 범위

### 포함

- `isRepeatingEvent` 함수의 모든 반복 유형 판별
- null/undefined 입력 시 안전한 처리
- 불완전한 객체(repeat 없음, repeat.type 없음) 처리
- Event 타입과 EventForm 타입 모두 지원

### 제외

- React 컴포넌트 렌더링 (통합 테스트 영역)
- UI 아이콘 표시 로직 (통합 테스트 영역)
- 배열 필터링 등 단순 조합 함수 (불필요)
- 타입 정의 검증 (TypeScript 컴파일러 영역)

---

## 3. 테스트 분류

| 구분        | 설명                                     |
| ----------- | ---------------------------------------- |
| 단위 테스트 | `isRepeatingEvent` 순수 함수 입출력 검증 |

---

## 4. 테스트 시나리오

### 대상 함수: `isRepeatingEvent`

| 시나리오 ID | 설명                            | 입력                              | 기대 결과 | 테스트 유형 |
| ----------- | ------------------------------- | --------------------------------- | --------- | ----------- |
| TC-U2-1-1   | daily 반복 일정을 true로 판별   | `{ repeat: { type: 'daily' } }`   | `true`    | 단위        |
| TC-U2-1-2   | weekly 반복 일정을 true로 판별  | `{ repeat: { type: 'weekly' } }`  | `true`    | 단위        |
| TC-U2-1-3   | monthly 반복 일정을 true로 판별 | `{ repeat: { type: 'monthly' } }` | `true`    | 단위        |
| TC-U2-1-4   | yearly 반복 일정을 true로 판별  | `{ repeat: { type: 'yearly' } }`  | `true`    | 단위        |
| TC-U2-1-5   | 일반 일정(none)을 false로 판별  | `{ repeat: { type: 'none' } }`    | `false`   | 단위        |
| TC-U2-1-6   | repeat 속성 없을 때 false 반환  | `{}`                              | `false`   | 단위 (엣지) |
| TC-U2-1-7   | repeat.type 없을 때 false 반환  | `{ repeat: {} }`                  | `false`   | 단위 (엣지) |
| TC-U2-1-8   | null 입력 시 false 반환         | `null`                            | `false`   | 단위 (엣지) |
| TC-U2-1-9   | undefined 입력 시 false 반환    | `undefined`                       | `false`   | 단위 (엣지) |

---

## 5. 구현 명세

### 함수 시그니처

```typescript
/**
 * 이벤트가 반복 일정인지 확인
 *
 * @param event - 검증할 이벤트 객체 (null/undefined 안전)
 * @returns 반복 일정이면 true, 일반 일정(none) 또는 유효하지 않으면 false
 *
 * @example
 * isRepeatingEvent({ repeat: { type: 'daily' } })   // true
 * isRepeatingEvent({ repeat: { type: 'none' } })    // false
 * isRepeatingEvent({})                              // false
 * isRepeatingEvent(null)                            // false
 */
export function isRepeatingEvent(event: Event | EventForm | null | undefined): boolean;
```

### 구현 위치

- **파일**: `src/utils/eventTypeChecker.ts`
- **테스트**: `src/__tests__/unit/eventTypeChecker.spec.ts`

### 의존성

- **없음** (완전히 독립적인 순수 함수)

---

## 6. 테스트 데이터

### 정상 케이스

```typescript
const dailyEvent = {
  id: '1',
  title: '매일 회의',
  repeat: { type: 'daily', interval: 1 },
};

const weeklyEvent = {
  id: '2',
  title: '매주 회의',
  repeat: { type: 'weekly', interval: 1 },
};

const monthlyEvent = {
  id: '3',
  title: '매월 보고',
  repeat: { type: 'monthly', interval: 1 },
};

const yearlyEvent = {
  id: '4',
  title: '연간 평가',
  repeat: { type: 'yearly', interval: 1 },
};

const normalEvent = {
  id: '5',
  title: '일반 회의',
  repeat: { type: 'none', interval: 1 },
};
```

### 엣지 케이스

```typescript
const noRepeatEvent = {
  id: '6',
  title: '속성 없음',
  // repeat 속성 없음
};

const incompleteRepeatEvent = {
  id: '7',
  title: '불완전한 객체',
  repeat: {}, // type 없음
};

const nullEvent = null;
const undefinedEvent = undefined;
```

---

## 7. 검증 기준 (Assertion Points)

### 정확성 검증

- [x] 모든 반복 유형(daily, weekly, monthly, yearly)을 `true`로 판별
- [x] 일반 일정(none)을 `false`로 판별
- [x] 불완전한 객체를 `false`로 안전하게 처리

### 안전성 검증

- [x] null 입력 시 에러 없이 `false` 반환
- [x] undefined 입력 시 에러 없이 `false` 반환
- [x] repeat 속성 누락 시 `false` 반환
- [x] repeat.type 속성 누락 시 `false` 반환

### 타입 안전성

- [x] Event 타입 지원
- [x] EventForm 타입 지원
- [x] null/undefined 유니온 타입 지원

---

## 8. 비고

### Feature2의 특수성

- UI 중심 기능으로 단위 테스트 범위가 제한적
- 통합 테스트 93점(Excellent)으로 충분히 검증됨
- 단위 테스트는 **핵심 판별 로직 1개만 추출**하여 재사용성 확보

### 단위 테스트의 가치

1. **재사용성**: 여러 컴포넌트에서 일관된 판별 로직 사용
2. **이중 검증**: 통합 테스트(UI 결과) + 단위 테스트(로직 정확성)
3. **엣지 케이스**: 통합 테스트에서 다루기 어려운 null/undefined 검증
4. **리팩터링 안전망**: UI 변경 시에도 로직 정확성 보장

### 구현 우선순위

- **높음**: `isRepeatingEvent` (권장, 비용 낮음, 효과 높음)
- **낮음**: 추가 Utility 함수 (현재는 불필요, 필요 시 점진적 추가)

---

## 9. 테스트 코드 작성 원칙

이 테스트는 다음 원칙을 따릅니다:

### DAMP (Descriptive and Meaningful Phrases)

- 각 테스트 케이스는 독립적이고 명확한 이름
- 중복을 허용하더라도 의도가 명확히 드러나도록 작성

### 결과 검증, 구현 검증 금지

- 입력 → 출력만 검증 (black box)
- 내부 구현 방식은 테스트하지 않음

### 읽기 좋은 테스트

- AAA 패턴 (Arrange-Act-Assert) 명확히 구분
- 테스트 이름만 봐도 무엇을 검증하는지 이해 가능

### 비즈니스 행위 중심

- "반복 일정 판별"이라는 비즈니스 의도 명확히 표현
- 기술적 세부사항보다 도메인 언어 사용

---

## 10. 예상 테스트 코드 구조

```typescript
// src/__tests__/unit/eventTypeChecker.spec.ts
import { describe, it, expect } from 'vitest';
import { isRepeatingEvent } from '../../utils/eventTypeChecker';

describe('isRepeatingEvent', () => {
  describe('정상 케이스: 반복 유형 판별', () => {
    it('TC-U2-1-1: daily 반복 일정을 true로 판별', () => {
      // Arrange
      const event = { repeat: { type: 'daily', interval: 1 } };

      // Act
      const result = isRepeatingEvent(event as any);

      // Assert
      expect(result).toBe(true);
    });

    // ... TC-U2-1-2 ~ TC-U2-1-4 (weekly, monthly, yearly)

    it('TC-U2-1-5: 일반 일정(none)을 false로 판별', () => {
      const event = { repeat: { type: 'none', interval: 1 } };
      expect(isRepeatingEvent(event as any)).toBe(false);
    });
  });

  describe('엣지 케이스: 안전한 처리', () => {
    it('TC-U2-1-6: repeat 속성 없을 때 false 반환', () => {
      const event = {};
      expect(isRepeatingEvent(event as any)).toBe(false);
    });

    // ... TC-U2-1-7 ~ TC-U2-1-9 (불완전한 객체, null, undefined)
  });
});
```

---

**작성 기준**:

- `/checklists/unit-test.md`
- Kent Beck의 TDD 원칙
- DAMP 원칙

**작성일**: 2025-10-30  
**통합 테스트 품질**: 93/100 (Excellent)  
**단위 테스트 범위**: 최소 (핵심 로직 1개)
