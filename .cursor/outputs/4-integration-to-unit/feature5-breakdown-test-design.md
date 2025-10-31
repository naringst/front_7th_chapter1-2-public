# Feature 5: 반복 일정 삭제 - Unit Test Candidates

## 분석 대상

- Integration Test: `src/__tests__/integration/feature5-integration.spec.tsx`
- Test Design: `.cursor/outputs/3-integration-test-design/feature5-test-design.md`

---

## 유닛 테스트 후보 식별 결과

### ✅ 후보 1: 반복 그룹 식별 함수 (`findRepeatGroup`)

**식별 근거:**

- TC-5-3-1에서 "동일한 반복 그룹의 모든 일정 삭제" 검증
- Feature 4에서 이미 구현 및 테스트됨 (재사용)
- 순수한 배열 필터링/검색 로직으로, 유닛 테스트로 분리 가능

**함수 시그니처 (기존):**

```typescript
function findRepeatGroup(events: Event[], targetEvent: Event): Event[];
```

**Feature 5 관점에서의 추가 검증 필요성:**

- Feature 4에서 이미 유닛 테스트 구현 완료
- Feature 5에서는 이 함수를 삭제 로직에서 재사용
- **결론**: 추가 유닛 테스트 불필요 (Feature 4에서 이미 검증됨)

---

## ❌ 유닛 테스트 후보에서 제외된 항목

### 1. 다이얼로그 UI 로직

- TC-5-1-1, TC-5-1-2 (다이얼로그 표시, 버튼 클릭)
- **제외 이유**: UI 렌더링 로직은 통합 테스트로만 검증

### 2. 삭제 API 호출

- TC-5-2-1, TC-5-3-1 (DELETE /api/events/{id} 호출)
- **제외 이유**: useEventOperations 훅 내부 로직, 통합 테스트로 충분

### 3. 단일/전체 삭제 분기 처리

- TC-5-2-1 ("예" 선택 시 단일 삭제), TC-5-3-1 ("아니오" 선택 시 전체 삭제)
- **제외 이유**: React 컴포넌트 내부 상태 관리 및 이벤트 핸들러 로직

### 4. 반복 일정 여부 확인

- TC-5-1-1, TC-5-1-2 (반복 일정인지 확인하여 다이얼로그 표시 여부 결정)
- **제외 이유**: Feature 2에서 이미 구현 및 테스트됨 (`isRepeatingEvent`)

---

## 📊 요약

| 후보 함수         | 파일 위치                              | 테스트 케이스 수 | 우선순위 |
| ----------------- | -------------------------------------- | ---------------- | -------- |
| `findRepeatGroup` | `src/utils/repeatGroupUtils.ts` (기존) | 0 (재사용)       | N/A      |

**총 0개 신규 함수, 0개 추가 유닛 테스트 케이스**

**이유**: Feature 5는 주로 UI 상호작용과 API 호출 로직으로 구성되어 있으며, 순수 함수 로직은 이미 Feature 4에서 구현 및 테스트된 `findRepeatGroup`을 재사용합니다.

---

## 🎯 다음 단계: Stage 5 (Unit Test Design)

**결론**: Feature 5는 유닛 테스트 설계가 불필요합니다.

이유:

1. 삭제 로직은 주로 React 컴포넌트와 훅에서 처리되며, 순수 함수가 아닙니다.
2. `findRepeatGroup`은 Feature 4에서 이미 구현 및 테스트되었습니다.
3. 나머지 로직(다이얼로그 표시, API 호출 등)은 통합 테스트로 충분히 검증 가능합니다.

**대안**:

- 통합 테스트로 모든 삭제 시나리오를 충분히 커버하고 있음 (TC-5-1-1 ~ TC-5-3-3, 총 8개 테스트 케이스)
- 추가 유닛 테스트는 코드 복잡도를 높일 뿐 실익이 없음

---

**작성일**: 2025-10-31  
**유닛 테스트 후보**: 0개 (신규)  
**예상 테스트 케이스**: 0개  
**권장사항**: 통합 테스트로 충분히 검증됨
