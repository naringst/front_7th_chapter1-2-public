🧩 1. 명확한 의도 (Clarity of Purpose)

한 테스트는 하나의 목적만 검증해야 합니다.

“로그인 성공” 테스트 안에서 “회원가입 이후 로그인”까지 검증하지 않음.

테스트 이름만 봐도 무슨 기능을 검증하는지 알 수 있어야 합니다.

// ✅ Good
it("logs in successfully with valid credentials", () => { ... });

// ❌ Bad
it("works", () => { ... });

🧱 2. 독립성 (Isolation)

각 테스트는 다른 테스트의 결과나 상태에 의존하지 않아야 합니다.

예: beforeEach나 afterEach에서 상태를 항상 초기화해야 함.

beforeEach(() => {
resetDatabase();
});

실행 순서에 관계없이 통과해야 하며, 병렬 실행 환경에서도 안정적이어야 합니다.

🧮 3. 명확한 단언 (Clear Assertions)

테스트의 핵심은 “무엇을 기대하는가(expect)”이므로,
검증 포인트(Assertion) 가 명확해야 합니다.

// ✅ Good
expect(result).toBe(200);
expect(response.body.user.name).toBe("Nari");

// ❌ Bad
expect(result).toBeTruthy();

여러 assert가 있다면, 논리적으로 연결되어야 하며 불필요한 중복은 제거합니다.

🔁 4. 유지보수성 (Maintainability)

테스트는 프로덕션 코드가 바뀌어도 쉽게 깨지지 않아야 합니다.

즉, UI 변경이나 refactor에도 견디는 수준의 추상화가 되어야 합니다.

// ✅ Good (DOM 변경에 덜 민감)
const button = screen.getByRole("button", { name: /submit/i });

// ❌ Bad (HTML 구조 변경 시 쉽게 깨짐)
const button = document.querySelector(".btn-primary");

테스트가 지나치게 구체적인 구현 세부사항(내부 state, 클래스명 등)에 의존하면, 리팩터링 시 유지보수가 어려워집니다.

⚡️ 5. 실행 속도 (Speed)

테스트는 짧고 빠르게 실행되어야 합니다.
→ 개발자가 “즉각적인 피드백”을 받을 수 있어야 하기 때문입니다.

느린 테스트는 통합(E2E) 테스트로 옮기고,
단위(Unit) 테스트는 가능한 한 짧게.

🧰 6. 재현성 (Determinism)

언제 실행해도 동일한 결과를 반환해야 합니다.

외부 API, 시간, 네트워크 상태에 의존하지 않도록 mock/stub을 적극적으로 사용합니다.

vi.useFakeTimers();
vi.mock("axios", () => ({ get: vi.fn() }));

📐 7. 구조화된 패턴 (Good Structure)

공통된 테스트 패턴(AAA: Arrange–Act–Assert)을 따릅니다.

// ✅ AAA 패턴 예시
// Arrange
const user = createUser("Nari");
// Act
const response = await login(user);
// Assert
expect(response.status).toBe(200);

테스트 스위트의 구조가 기능 단위(모듈, 페이지, 유즈케이스 등)로 잘 분리되어 있어야 함.

🧭 8. 가독성 (Readability)

테스트는 문서처럼 읽혀야 합니다.
→ 테스트는 일종의 “명세서(living documentation)”이기도 합니다.

의미 없는 mocking, setup 코드 남발보다는,
실제 사용자 관점의 흐름을 표현하는 게 좋습니다.

🔒 9. 신뢰성 (Reliability)

테스트는 False Positive(실패해야 할 때 통과),
**False Negative(통과해야 할 때 실패)**를 최소화해야 합니다.

flaky(가끔 실패하는) 테스트는 가장 큰 신뢰 저하 요인입니다.

📊 10. 커버리지보다 “가치” (Coverage vs Value)

테스트 커버리지(%)는 참고 지표일 뿐, 품질을 대변하지 않습니다.

중요한 것은 “사용자 가치와 실패 리스크가 높은 부분을 충분히 검증하느냐”입니다.
→ 모든 코드가 아니라 핵심 시나리오를 우선 검증해야 합니다.
