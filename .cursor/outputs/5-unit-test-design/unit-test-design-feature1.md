# Unit Candidates for "FEATURE1: 반복 유형 선택"

## 1. RepeatScheduler (Utility)

- **Responsibilities**: 반복 유형에 따라 저장될 일정 인스턴스 목록을 생성하고 예외 상황(31일, 윤년)을 처리한다.
- **Methods / Interfaces**:
  - `generateDailyOccurrences(params: RecurringGenerationParams): EventForm[]` – 요청된 횟수만큼 연속된 날짜를 생성한다.
  - `generateWeeklyOccurrences(params: RecurringGenerationParams): EventForm[]` – 동일한 요일로 주간 반복 일정을 생성한다.
  - `generateMonthlyOccurrences(params: RecurringGenerationParams): EventForm[]` – 월 반복 시 대상 일이 없는 월을 건너뛴다.
  - `generateYearlyOccurrences(params: RecurringGenerationParams): EventForm[]` – 윤년 2월 29일 예외를 처리하며 연간 반복을 생성한다.
  - `generateSingleEvent(baseEvent: EventForm): EventForm[]` – 반복 미선택 시 단일 일정만 반환한다.
- **Relations**: 날짜 검증은 `RepeatDateUtils`에 의존하며, 상위 컴포넌트나 훅에서 호출되어 반복 일정 배열을 생성한다.

## 2. RepeatDateUtils (Utility)

- **Responsibilities**: 반복 일정 계산에 필요한 날짜 유효성 검사와 윤년 판별을 수행한다.
- **Methods / Interfaces**:
  - `isLeapYear(year: number): boolean` – 윤년 여부를 판별한다.
  - `getLastDayOfMonth(year: number, month: number): number` – 해당 월의 마지막 날짜를 반환한다.
  - `isValidDateInMonth(year: number, month: number, day: number): boolean` – 지정한 날짜가 유효한지 확인한다.
  - `addDays(date: string, delta: number): string` – ISO 날짜 문자열에 일 단위 증분을 적용한다.
  - `addWeeks(date: string, delta: number): string` – ISO 날짜 문자열에 주 단위 증분을 적용한다.
  - `addMonths(date: string, delta: number): string` – ISO 날짜 문자열에 월 단위 증분을 적용한다.
  - `addYears(date: string, delta: number): string` – ISO 날짜 문자열에 연 단위 증분을 적용한다.
- **Relations**: `RepeatScheduler`의 모든 생성 함수에서 사용되며, 다른 기능(예: 반복 종료 계산)에서도 재사용 가능하다.

## 3. RepeatOptionsProvider (Utility)

- **Responsibilities**: UI에 노출할 반복 옵션 목록을 제공한다.
- **Methods / Interfaces**:
  - `getRepeatOptions(): RepeatType[]` – 반복 유형 옵션 배열(daily, weekly, monthly, yearly)을 반환한다.
  - `getRepeatOptionLabel(type: RepeatType): string` – 각 반복 유형에 대응하는 한글 레이블을 반환한다.
- **Relations**: UI 컴포넌트나 훅에서 드롭다운 옵션을 구성할 때 사용된다.
