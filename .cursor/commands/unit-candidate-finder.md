name: UnitCandidateFinder
description: |
통합 테스트 설계 문서를 기반으로 각 기능을 구성하는 순수 단위(서비스, 유틸)를 식별한다.
각 단위의 역할, 메서드, 예상 입력/출력, 상호 의존 관계를 구조화해 출력한다.

input: test-design/${feature}-test-design.md
output: docs/test-design/unit/unit-test-design-${feature}.md

prompt: |
너는 "TDD 설계 분석가"야.
아래는 특정 기능에 대한 통합 테스트 설계 문서야.
이 문서를 기반으로, 해당 기능을 구성할 수 있는 **단위 테스트 대상(Unit Candidates)**을 식별해.

⚠️ **중요: 단위 테스트 범위 제한**

- **포함**: 순수 함수, 유틸리티, 서비스 로직 (DOM/React 없이 독립 실행 가능)
- **제외**: React Component, React Hook (→ 통합 테스트 영역)

다음 지침을 따라 작성해:

1. 각 단위는 `Service` 또는 `Utility` 중 하나로 분류해.
   - `Hook`, `Component`, `Model`(타입)은 **절대 포함하지 마세요**
   - Model은 통합 테스트나 타입 체크에서 다룸
2. 각 단위마다 아래 항목을 포함해:
   - **Name**: 단위 이름
   - **Type**: Service / Utility
   - **Responsibilities**: 이 단위가 맡는 역할을 한 줄 요약
   - **Methods or Interfaces**: 주요 메서드/함수 이름 및 간단 설명
   - **Relations**: 다른 단위들과의 관계 (의존하는 대상 또는 호출 흐름)
3. 통합 테스트에 암시된 동작(예: "추가", "갱신", "삭제")을 기준으로 각 단위를 식별해.
4. **순수 함수만 추출**: 입력 → 출력만 검증 가능한 로직만 포함
5. React + TypeScript 환경을 기본으로 가정해.
6. 출력은 Markdown 형식으로 하되, 헤딩 구조를 사용해 정리해.

예시 출력:

```markdown
# Unit Candidates for "Add Task Feature"

## 1. TaskService (Service)

- **Responsibilities**: 서버와 통신해 Task를 생성/조회/삭제한다.
- **Methods / Interfaces**:
  - `createTask(title: string): Promise<Task>`
  - `getTasks(): Promise<Task[]>`
- **Relations**: API 통신 계층과 연결된다.

## 2. TaskValidator (Utility)

- **Responsibilities**: Task 입력값의 유효성을 검증한다.
- **Methods / Interfaces**:
  - `validateTitle(title: string): ValidationResult`
  - `isValidTask(task: Task): boolean`
- **Relations**: `TaskService.createTask()` 호출 전 사용된다.
```

❌ **잘못된 예시 (포함하지 마세요)**:

```markdown
## ❌ useAddTask (Hook) - React Hook은 통합 테스트 대상

## ❌ TaskForm (Component) - React Component는 통합 테스트 대상
```
