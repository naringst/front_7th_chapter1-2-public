# Feature 4: 반복 일정 수정 - Unit Test Candidates

## 분석 대상
- Integration Test: `src/__tests__/integration/feature4-integration.spec.tsx`
- Test Design: `.cursor/outputs/3-integration-test-design/feature4-test-design.md`

---

## 유닛 테스트 후보 식별 결과

### ✅ 후보 1: 반복 그룹 식별 함수 (`findRepeatGroup`)

**식별 근거:**
- TC-4-2-1, TC-4-2-3에서 "같은 반복 그룹의 모든 일정" 검증
- 이는 순수한 배열 필터링/검색 로직으로, 유닛 테스트로 분리 가능

**함수 시그니처 (예상):**
```typescript
function findRepeatGroup(
  events: Event[],
  targetEvent: Event
): Event[]
```

**유닛 테스트 시나리오:**
1. 같은 제목, 시간, 반복 유형의 이벤트들 → 모든 그룹 멤버 반환
2. 유일한 반복 일정 → 자기 자신만 반환 (배열 길이 1)
3. 제목이 같지만 시간이 다른 이벤트 → 제외
4. 제목과 시간이 같지만 반복 유형이 다른 이벤트 → 제외
5. 일반 일정 (repeat.type = 'none') → 빈 배열 또는 자기 자신만
6. 빈 배열 입력 → 빈 배열 반환
7. 존재하지 않는 이벤트 → 빈 배열 반환

---

### ✅ 후보 2: 단일/전체 수정 적용 함수 (`applyEventUpdate`)

**식별 근거:**
- TC-4-1-1에서 "단일 수정 시 repeat.type = 'none'" 처리
- TC-4-2-1에서 "전체 수정 시 repeat.type 유지" 처리
- 이는 순수한 객체 변환 로직

**함수 시그니처 (예상):**
```typescript
function applyEventUpdate(
  event: Event,
  updates: Partial<Event>,
  mode: 'single' | 'all'
): Event
```

**유닛 테스트 시나리오:**
1. mode = 'single', 제목 수정 → repeat.type = 'none'
2. mode = 'all', 제목 수정 → repeat.type 유지
3. mode = 'single', 여러 필드 수정 → repeat.type = 'none'
4. mode = 'all', 시간 수정 → repeat.type 유지
5. 일반 일정 (repeat.type = 'none') → mode 무관하게 'none' 유지
6. updates가 빈 객체 → 원본 이벤트 반환 (수정 없음)
7. mode가 undefined → 기본값 'single' 처리 (또는 에러)

---

### ✅ 후보 3: 반복 일정 여부 확인 함수 (`isRepeatingEvent`)

**식별 근거:**
- TC-4-3-1, TC-4-3-4에서 "반복 일정인지 확인하여 다이얼로그 표시 여부 결정"
- 이미 Feature 2에서 구현되었을 가능성 있음 (재사용)

**함수 시그니처 (기존):**
```typescript
function isRepeatingEvent(event: Event | EventForm | null | undefined): boolean
```

**추가 유닛 테스트 시나리오 (Feature 4 관점):**
1. repeat.type = 'daily' → true
2. repeat.type = 'none' → false
3. repeat.type = undefined → false (방어 코드)

---

## ❌ 유닛 테스트 후보에서 제외된 항목

### 1. 다이얼로그 UI 로직
- TC-4-3-1, TC-4-3-2, TC-4-3-3 (다이얼로그 표시, 버튼 클릭)
- **제외 이유**: UI 렌더링 로직은 통합 테스트로만 검증

### 2. 이벤트 수정 API 호출
- TC-4-1-1, TC-4-2-1 (PUT /api/events/{id} 호출)
- **제외 이유**: useEventOperations 훅 내부 로직, 통합 테스트로 충분

### 3. 아이콘 표시/숨김 로직
- TC-4-1-2, TC-4-2-2 (반복 아이콘 UI 변경)
- **제외 이유**: UI 렌더링 로직, Feature 2와 중복

---

## 📊 요약

| 후보 함수 | 파일 위치 (예상) | 테스트 케이스 수 | 우선순위 |
|-----------|------------------|------------------|----------|
| `findRepeatGroup` | `src/utils/repeatGroupUtils.ts` | 7 | High |
| `applyEventUpdate` | `src/utils/eventUpdateUtils.ts` | 7 | High |
| `isRepeatingEvent` | `src/utils/eventTypeChecker.ts` (기존) | 3 (추가) | Low (이미 구현) |

**총 2개 신규 함수, 17개 유닛 테스트 케이스 (isRepeatingEvent 제외 시 14개)**

---

## 🎯 다음 단계: Stage 5 (Unit Test Design)

유닛 테스트 후보 2개에 대한 상세한 테스트 설계를 작성합니다:
1. `findRepeatGroup` → 반복 그룹 식별
2. `applyEventUpdate` → 단일/전체 수정 적용

(`isRepeatingEvent`는 이미 Feature 2에서 구현되었으므로 추가 테스트 불필요)

---

**작성일**: 2025-10-30  
**유닛 테스트 후보**: 2개 (신규)  
**예상 테스트 케이스**: 14개

