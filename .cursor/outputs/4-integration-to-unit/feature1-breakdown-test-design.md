# 🧪 테스트 설계서 - FEATURE1 (반복 유형 선택) 단위 테스트

## 1. 테스트 목적

반복 일정 생성 기능을 구성하는 내부 책임(상태 토글, 반복 유형 매핑, 반복 일정 생성 로직)이 명세에 따라 정확히 동작하는지 단위 수준에서 검증한다. UI 표시 여부와 무관하게, 해당 로직이 올바른 상태값과 출력 데이터를 산출하여 이후 통합 단계에서 신뢰할 수 있는 기반을 제공하는 것을 목표로 한다.

## 2. 테스트 범위

- 포함
  - 반복 설정 토글 로직 (`isRepeating`, `repeatType`, `repeatOptionsVisibility`)
  - 반복 유형 선택 값과 내부 상태/페이로드 매핑 로직
  - 반복 일정 생성 유틸 (일/주/월/년, 31일 및 윤년 예외 처리 포함)
  - 반복 미선택 시 단일 일정 생성 분기
- 제외
  - 실제 UI 렌더링 및 드롭다운 컴포넌트 동작 (통합 테스트에서 검증)
  - 서버 API 통신 및 네트워크 에러 처리
  - 토스트/알림 등 사용자 피드백 표현

## 3. 테스트 분류

| 구분        | 설명                          |
| ----------- | ----------------------------- |
| 단위 테스트 | 상태/유틸 함수 책임 검증       |
| 통합 테스트 | (별도 설계)                   |
| E2E 테스트  | (본 설계 범위에 포함되지 않음) |

## 4. 테스트 시나리오

| 시나리오 ID | 설명                                                         | 입력/조건                                                      | 기대 결과                                                                 | 테스트 유형 |
| ----------- | ------------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------- |
| U-1         | 반복 설정을 활성/비활성화할 때 상태와 가시성 플래그가 올바르게 갱신된다 | 초기 상태, 토글 입력(on/off)                                     | `isRepeating` 값이 토글 입력과 일치, off 시 `repeatType = 'none'`, 가시성 false | 단위        |
| U-2         | 반복 설정 재토글 시 연속 동작이 누락 없이 유지된다                     | on → off → on 순차 토글                                         | 각 단계에서 상태가 지정된 순서대로 전환되고, 마지막 on 시 이전 `repeatType` 복원(없다면 기본값) | 단위        |
| U-3         | 반복 유형 선택 시 내부 상태/페이로드가 매핑된다                         | type 선택값(daily/weekly/monthly/yearly)                        | 각 선택값에 대응하는 상태(`repeatType`)와 저장 페이로드 `repeat.type`이 일치             | 단위        |
| U-4         | 반복 유형 옵션 목록을 제공하는 헬퍼가 명세된 4개 옵션을 반환한다             | 없음                                                            | 배열에 daily/weekly/monthly/yearly 네 가지 옵션이 순서 유지로 포함                   | 단위        |
| U-5         | 일/주 반복 생성 유틸이 지정된 기간 내 모든 날짜를 생성한다                 | 시작일, 기간/횟수, type=daily/weekly                            | 생성된 이벤트 목록이 기간 동안 모든 날짜/주를 포함하고 누락 없음                           | 단위        |
| U-6         | 월 반복 생성 시 31일이 없는 달은 제외된다                                | 시작일=1월31일, type=monthly, 생성 기간(예: 6개월)               | 2월·4월·6월·9월·11월이 결과에 포함되지 않고 31일이 존재하는 월만 생성                     | 단위        |
| U-7         | 월 반복 생성 시 31일 이후 첫 유효 달이 존재하면 올바른 날짜로 이어진다        | 시작일=1월31일, type=monthly, 생성 기간(예: 3개월)               | 3월 31일, 5월 31일 등 유효 월이 순차적으로 포함                                   | 단위        |
| U-8         | 윤년 2월 29일 연간 반복은 평년을 건너뛴다                               | 시작일=2024-02-29, type=yearly, 생성 기간(예: 5년)               | 2025~2027 결과 없음, 2028-02-29 포함                                             | 단위        |
| U-9         | 반복 설정 없이 저장 시 일반 일정만 생성된다                              | `isRepeating=false`, 기본 일정 입력                             | 반환 결과가 단일 일정이며 `repeat.type === 'none'`                                   | 단위        |

### describe/it 구조 초안

```ts
describe('repeatSettingsManager', () => {
  describe('toggleRepeat', () => {
    it('toggles isRepeating true and shows options when enabled');
    it('resets repeatType to "none" and hides options when disabled');
    it('restores previous repeatType when re-enabled if available');
  });

  describe('getRepeatOptions', () => {
    it('returns four repeat options in defined order');
  });

  describe('applyRepeatType', () => {
    it('sets repeatType and payload type for daily');
    it('sets repeatType and payload type for weekly');
    it('sets repeatType and payload type for monthly');
    it('sets repeatType and payload type for yearly');
  });
});

describe('recurringEventGenerator', () => {
  describe('generateDailyEvents', () => {
    it('creates events for every day within range');
  });

  describe('generateWeeklyEvents', () => {
    it('creates events for each week on same weekday');
  });

  describe('generateMonthlyEvents', () => {
    it('skips months without the target day when day=31');
    it('continues with next valid month that has the target day');
  });

  describe('generateYearlyEvents', () => {
    it('excludes non-leap years for Feb 29 start');
    it('includes next leap year with Feb 29 date');
  });

  describe('generateSingleEvent', () => {
    it('returns only the base event when repeat disabled');
  });
});
```

## 5. 비고

- 반복 일정 생성 유틸은 아직 구현되지 않았으므로, 위 테스트 설계를 기준으로 유틸 함수 책임을 정의하고 구현 시 본 테스트 명세를 참고해야 한다.
- 반복 옵션 복원 로직(토글 재활성화 시 기존 선택 유지) 여부가 명확하지 않으므로, 실제 구현 방향에 따라 U-2 기대 결과를 조정할 필요가 있다. 구현 전에 제품 요구사항을 재확인해야 한다.
