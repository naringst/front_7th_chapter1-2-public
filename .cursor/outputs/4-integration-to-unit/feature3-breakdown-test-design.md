# Feature 3: 반복 일정 종료 조건 - Unit Test Candidates

## 분석 대상
- Integration Test: `src/__tests__/integration/feature3-integration.spec.tsx`
- Test Design: `.cursor/outputs/3-integration-test-design/feature3-test-design.md`

---

## 유닛 테스트 후보 식별 결과

### ✅ 후보 1: 종료 날짜 검증 함수 (`validateRepeatEndDate`)

**식별 근거:**
- TC-3-2-1에서 "종료 날짜가 시작 날짜보다 이전이면 에러 메시지 표시" 검증
- 이는 순수한 날짜 비교 로직으로, 유닛 테스트로 분리 가능

**함수 시그니처 (예상):**
```typescript
function validateRepeatEndDate(
  startDate: string,
  endDate: string | undefined
): { valid: boolean; error?: string }
```

**유닛 테스트 시나리오:**
1. 종료 날짜가 시작 날짜보다 이전 → `{ valid: false, error: "종료 날짜는 시작 날짜 이후여야 합니다" }`
2. 종료 날짜가 시작 날짜와 같음 → `{ valid: true }`
3. 종료 날짜가 시작 날짜보다 이후 → `{ valid: true }`
4. 종료 날짜가 undefined → `{ valid: true }` (기본값 적용)
5. 종료 날짜가 2025-12-31 초과 → `{ valid: true }` (자동 제한, 경고 없음)
6. 잘못된 날짜 형식 → `{ valid: false, error: "..." }`

---

### ✅ 후보 2: 종료 날짜 기본값 적용 함수 (`getRepeatEndDate`)

**식별 근거:**
- TC-3-1-4에서 "종료 날짜 미입력 시 기본값(2025-12-31)까지 생성" 검증
- TC-3-2-3에서 "종료 날짜가 2025-12-31 초과 시 2025-12-31까지만 생성" 검증
- 이는 순수한 날짜 처리 로직

**함수 시그니처 (예상):**
```typescript
function getRepeatEndDate(
  endDate: string | undefined
): string
```

**유닛 테스트 시나리오:**
1. `endDate === undefined` → `"2025-12-31"`
2. `endDate === null` → `"2025-12-31"`
3. `endDate === ""` → `"2025-12-31"`
4. `endDate === "2025-10-31"` → `"2025-10-31"` (그대로 반환)
5. `endDate === "2025-12-31"` → `"2025-12-31"` (경계값)
6. `endDate === "2026-01-01"` → `"2025-12-31"` (최대값 제한)
7. `endDate === "2027-12-31"` → `"2025-12-31"` (최대값 제한)
8. `endDate === "2024-12-31"` → `"2024-12-31"` (과거 날짜는 허용, 시작 날짜 검증은 별도)

---

### ✅ 후보 3: 종료 날짜까지 반복 일정 생성 함수 (`generateRecurringEventsUntilEndDate`)

**식별 근거:**
- TC-3-1-3, TC-3-2-2, TC-3-2-3에서 종료 날짜에 따른 생성 개수 검증
- 기존 `generateRecurringEvents` 확장 또는 수정

**함수 시그니처 (예상):**
```typescript
function generateRecurringEventsUntilEndDate(
  baseEvent: Event | EventForm,
  endDate: string
): Event[]
```

**유닛 테스트 시나리오:**
1. 매일 반복, 10/1~10/5 → 5개 생성
2. 매일 반복, 10/1~10/10 → 10개 생성, 10/11은 없음
3. 매주 반복, 10/1~10/31 → 5개 생성
4. 매월 반복, 10/1~12/31 → 3개 생성
5. 연간 반복, 10/1~2025-12-31 → 1개 생성
6. 종료 날짜 = 시작 날짜 → 1개 생성
7. 종료 날짜가 첫 반복 전 → 1개 생성 (시작일만)

---

## ❌ 유닛 테스트 후보에서 제외된 항목

### 1. UI 표시 로직
- TC-3-1-1 (종료 날짜 필드 표시/숨김)
- TC-3-3-3 (일정 목록에서 종료 날짜 표시)
- **제외 이유**: UI 렌더링 로직은 통합 테스트로만 검증

### 2. 이벤트 수정 로직
- TC-3-3-1, TC-3-3-2 (종료 날짜 수정)
- **제외 이유**: API 호출과 상태 관리가 포함되어 통합 테스트로 충분

### 3. API 호출 로직
- MSW를 사용한 POST /api/events-list 호출
- **제외 이유**: useEventOperations 훅 내부 로직, 통합 테스트로 충분

---

## 📊 요약

| 후보 함수 | 파일 위치 (예상) | 테스트 케이스 수 | 우선순위 |
|-----------|------------------|------------------|----------|
| `validateRepeatEndDate` | `src/utils/repeatValidation.ts` | 6 | High |
| `getRepeatEndDate` | `src/utils/repeatDateUtils.ts` | 8 | High |
| `generateRecurringEventsUntilEndDate` | `src/utils/repeatScheduler.ts` | 7 | Medium |

**총 3개 함수, 21개 유닛 테스트 케이스**

---

## 🎯 다음 단계: Stage 5 (Unit Test Design)

유닛 테스트 후보 3개에 대한 상세한 테스트 설계를 작성합니다:
1. `validateRepeatEndDate` → 날짜 검증 로직
2. `getRepeatEndDate` → 기본값 및 최대값 처리
3. `generateRecurringEventsUntilEndDate` → 종료 날짜까지 반복 생성

---

**작성일**: 2025-10-30  
**유닛 테스트 후보**: 3개  
**예상 테스트 케이스**: 21개

