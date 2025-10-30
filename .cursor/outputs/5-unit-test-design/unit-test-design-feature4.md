# 🧪 유닛 테스트 설계서: Feature 4 - 반복 일정 수정

## 1. 테스트 목적

반복 일정 수정 관련 순수 함수들이 올바르게 동작하는지 검증합니다.

- 반복 그룹 식별 로직의 정확성
- 단일/전체 수정 적용 로직의 정확성

## 2. 테스트 범위

### 포함

- `findRepeatGroup`: 반복 그룹 식별 함수
- `applyEventUpdate`: 단일/전체 수정 적용 함수

### 제외

- UI 렌더링 로직
- API 호출 로직
- React 컴포넌트 및 훅
- `isRepeatingEvent` (이미 Feature 2에서 구현 및 테스트)

## 3. 테스트 분류

| 구분        | 설명                              |
| ----------- | --------------------------------- |
| 단위 테스트 | 순수 함수의 입력-출력 검증        |
| 통합 테스트 | (제외) UI 및 API 통합은 별도 검증 |

---

## 4. 테스트 시나리오

### 함수 1: `findRepeatGroup`

**위치**: `src/utils/repeatGroupUtils.ts` (신규 파일)

**함수 시그니처**:

```typescript
function findRepeatGroup(events: Event[], targetEvent: Event): Event[];
```

**테스트 케이스**:

| TC ID  | 설명                                                    | 입력                                                                                                                     | 기대 결과                            | 테스트 유형 |
| ------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ | ----------- |
| TC-F-1 | 같은 그룹의 모든 이벤트를 반환한다                      | events: [event1, event2, event3]<br>모두 title="팀 미팅", startTime="10:00", repeat.type="weekly"<br>targetEvent: event1 | `[event1, event2, event3]`           | 단위        |
| TC-F-2 | 유일한 반복 일정은 자기 자신만 반환한다                 | events: [singleEvent]<br>targetEvent: singleEvent                                                                        | `[singleEvent]`                      | 단위        |
| TC-F-3 | 제목이 같지만 시간이 다른 이벤트는 제외한다             | events: [event1 (10:00), event2 (11:00)]<br>같은 제목, 다른 시간<br>targetEvent: event1                                  | `[event1]` (event2 제외)             | 단위        |
| TC-F-4 | 제목과 시간이 같지만 반복 유형이 다른 이벤트는 제외한다 | events: [event1 (weekly), event2 (daily)]<br>같은 제목/시간, 다른 반복 유형<br>targetEvent: event1                       | `[event1]` (event2 제외)             | 단위        |
| TC-F-5 | 일반 일정(repeat.type='none')은 자기 자신만 반환한다    | events: [normalEvent1, normalEvent2]<br>같은 제목/시간, 모두 repeat.type='none'<br>targetEvent: normalEvent1             | `[normalEvent1]` (normalEvent2 제외) | 단위        |
| TC-F-6 | 빈 배열 입력 시 빈 배열을 반환한다                      | events: []<br>targetEvent: event1                                                                                        | `[]`                                 | 단위        |
| TC-F-7 | 존재하지 않는 이벤트는 빈 배열을 반환한다               | events: [event1, event2]<br>targetEvent: event3 (존재하지 않음)                                                          | `[]`                                 | 단위        |

---

### 함수 2: `applyEventUpdate`

**위치**: `src/utils/eventUpdateUtils.ts` (신규 파일)

**함수 시그니처**:

```typescript
function applyEventUpdate(event: Event, updates: Partial<Event>, mode: 'single' | 'all'): Event;
```

**테스트 케이스**:

| TC ID  | 설명                                                             | 입력                                                                                                                              | 기대 결과                                                                         | 테스트 유형 |
| ------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------- |
| TC-A-1 | mode='single', 제목 수정 시 repeat.type='none'으로 변경된다      | event: { title="팀 미팅", repeat.type="weekly" }<br>updates: { title="개인 미팅" }<br>mode: 'single'                              | `{ title="개인 미팅", repeat.type="none" }`                                       | 단위        |
| TC-A-2 | mode='all', 제목 수정 시 repeat.type이 유지된다                  | event: { title="팀 미팅", repeat.type="weekly" }<br>updates: { title="헬스" }<br>mode: 'all'                                      | `{ title="헬스", repeat.type="weekly" }`                                          | 단위        |
| TC-A-3 | mode='single', 여러 필드 수정 시 repeat.type='none'으로 변경된다 | event: { title="회의", startTime="10:00", repeat.type="daily" }<br>updates: { title="미팅", startTime="11:00" }<br>mode: 'single' | `{ title="미팅", startTime="11:00", repeat.type="none" }`                         | 단위        |
| TC-A-4 | mode='all', 시간 수정 시 repeat.type이 유지된다                  | event: { startTime="09:00", repeat.type="monthly" }<br>updates: { startTime="10:00" }<br>mode: 'all'                              | `{ startTime="10:00", repeat.type="monthly" }`                                    | 단위        |
| TC-A-5 | 일반 일정(repeat.type='none')은 mode 무관하게 'none' 유지        | event: { title="일반", repeat.type="none" }<br>updates: { title="수정" }<br>mode: 'single' 또는 'all'                             | `{ title="수정", repeat.type="none" }`                                            | 단위        |
| TC-A-6 | updates가 빈 객체면 원본 이벤트 그대로 반환된다                  | event: { title="회의", repeat.type="weekly" }<br>updates: {}<br>mode: 'single'                                                    | `{ title="회의", repeat.type="weekly" }` (mode='single'이지만 수정 없으므로 유지) | 단위        |
| TC-A-7 | 수정되지 않은 필드는 원본 값을 유지한다                          | event: { title="회의", date="2025-10-01", startTime="10:00" }<br>updates: { title="미팅" }<br>mode: 'all'                         | `{ title="미팅", date="2025-10-01", startTime="10:00" }`                          | 단위        |

---

## 5. 테스트 데이터

### Mock Events for Testing

```typescript
const mockRepeatingEvent: Event = {
  id: 'repeat-1',
  title: '팀 미팅',
  date: '2025-10-06',
  startTime: '10:00',
  endTime: '11:00',
  description: '주간 팀 미팅',
  location: '회의실',
  category: '업무',
  repeat: { type: 'weekly', interval: 1 },
  notificationTime: 10,
};

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

const mockRepeatingGroup: Event[] = [
  { ...mockRepeatingEvent, id: 'repeat-1', date: '2025-10-06' },
  { ...mockRepeatingEvent, id: 'repeat-2', date: '2025-10-13' },
  { ...mockRepeatingEvent, id: 'repeat-3', date: '2025-10-20' },
];
```

## 6. 검증 기준 (Assertion Points)

### `findRepeatGroup`

- [ ] 같은 제목, 시간, 반복 유형의 이벤트들을 모두 반환
- [ ] 하나라도 다르면 제외
- [ ] 일반 일정은 그룹에 속하지 않음
- [ ] 빈 배열 입력 → 빈 배열 반환
- [ ] 존재하지 않는 이벤트 → 빈 배열 반환

### `applyEventUpdate`

- [ ] mode='single' → repeat.type='none'
- [ ] mode='all' → repeat.type 유지
- [ ] 일반 일정 → mode 무관하게 'none' 유지
- [ ] 수정되지 않은 필드는 원본 값 유지
- [ ] 빈 updates → 원본 이벤트 반환

## 7. 엣지 케이스 및 경계값

### `findRepeatGroup`

| 케이스              | 입력                | 기대 동작                 |
| ------------------- | ------------------- | ------------------------- |
| 그룹 크기 = 1       | 유일한 반복 일정    | 자기 자신만 반환          |
| 그룹 크기 = 100     | 매우 큰 그룹        | 모든 100개 반환           |
| 제목에 특수문자     | title="회의\t미팅"  | 정확히 일치하는 것만 반환 |
| startTime = endTime | 같은 시작/종료 시간 | 시작 시간으로 비교        |

### `applyEventUpdate`

| 케이스                | 입력                          | 기대 동작                        |
| --------------------- | ----------------------------- | -------------------------------- |
| mode = undefined      | mode 생략                     | 기본값 'single' 처리 (또는 에러) |
| updates에 repeat 포함 | updates.repeat.type = 'daily' | mode에 따라 처리                 |
| updates에 id 포함     | updates.id = 'new-id'         | id는 변경하지 않음 (또는 에러)   |

## 8. 비고

### 구현 시 고려사항

- **반복 그룹 식별 기준**: `title`, `startTime`, `endTime`, `repeat.type`, `repeat.interval` 모두 일치
- **일반 일정은 그룹 없음**: `repeat.type = 'none'`인 경우 자기 자신만 그룹
- **대소문자 구분**: 제목 비교 시 대소문자 구분 (정확한 일치)
- **날짜는 그룹 식별에서 제외**: 같은 그룹은 날짜가 다를 수 있음 (반복이므로)
- **mode='single'일 때 항상 repeat.type='none'**: 단일 수정은 반복 속성 제거

### 테스트 코드 구조

```typescript
describe('repeatGroupUtils', () => {
  describe('findRepeatGroup', () => {
    it('TC-F-1: 같은 그룹의 모든 이벤트를 반환한다', () => {
      const result = findRepeatGroup(mockRepeatingGroup, mockRepeatingGroup[0]);
      expect(result).toHaveLength(3);
      expect(result).toEqual(expect.arrayContaining(mockRepeatingGroup));
    });
    // ... 더 많은 테스트
  });
});

describe('eventUpdateUtils', () => {
  describe('applyEventUpdate', () => {
    it('TC-A-1: mode="single", 제목 수정 시 repeat.type="none"으로 변경된다', () => {
      const result = applyEventUpdate(mockRepeatingEvent, { title: '개인 미팅' }, 'single');
      expect(result.title).toBe('개인 미팅');
      expect(result.repeat.type).toBe('none');
    });
    // ... 더 많은 테스트
  });
});
```

---

**테스트 설계 완료일**: 2025-10-30  
**총 테스트 함수**: 2개  
**총 테스트 케이스**: 14개 (TC-F: 7, TC-A: 7)  
**테스트 유형**: 단위 테스트 100%
