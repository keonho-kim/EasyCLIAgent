# Repository Agent Guide

## Scope
이 문서는 EasyCLIAgent 저장소 전체에 적용되는 에이전트 운영 지침입니다. 하위 폴더에 별도의 `AGENTS.md`가 존재할 경우, 해당 문서의 규칙이 우선합니다.

## 프로젝트 이해
- **핵심 목표**: Gemini CLI와 Claude Code를 GUI로 통합하여 멀티 워크스페이스를 지원하는 생산성 도구를 제공합니다.
- **런타임 분리**: `src`는 React/Vite 기반 렌더러, `src-electron`은 Electron 메인 프로세스 로직을 담당합니다. 경로를 넘나드는 변경 시 IPC 계약을 반드시 검토하십시오.
- **Feature-Sliced Design**: `components/`, `features/`, `shared/`, `stores/`, `utils/` 구조를 준수하고, 새로운 기능은 `features/<feature-name>`로 구성합니다.

## 문서 작성 원칙
- **언어 스타일**: 기본 서술은 한국어로, 기술 용어와 API 명칭은 영어 원문을 유지합니다. README, CLAUDE.md의 톤을 참고하세요.
- **구조화**: Heading과 bullet을 적극 활용하여 요약 → 상세 → 예시 순으로 정보를 제공합니다.
- **참조 연결**: 기능 또는 설계 변경 시 `docs/architecture.md`, `CLAUDE.md`, 관련 README 섹션을 교차 참조하고, 링크나 상대 경로를 명시합니다.
- **변경 이유 명시**: 문서 업데이트 시 “왜”가 드러나도록 배경과 기대 효과를 덧붙입니다.
- **예제 코드**: TypeScript 예시는 실제 프로젝트 규약(함수형 컴포넌트, Zustand 스토어 등)을 반영하고 20줄 내외로 간결하게 유지합니다.

## 아키텍처 및 코드 가이드
- **SOLID & Clean Code**: 모든 모듈은 단일 책임을 갖도록 설계하며, 파일 길이는 300줄을 넘기지 않습니다.
- **상태 관리**: Zustand 스토어는 도메인 단위로 분리하고, selector 기반 구독을 사용하여 리렌더를 최소화합니다.
- **IPC Layer**: `src-electron/ipcHandlers`와 `src/shared/types` 사이의 타입 정의를 동기화하고, 채널 이름은 `app/<domain>/<action>` 패턴을 따릅니다.
- **비동기 처리**: `async/await`을 기본으로 하되, 에러는 `Result` 유틸 또는 커스텀 Error 클래스로 래핑해 컨텍스트 정보를 제공합니다.
- **스타일링**: TailwindCSS utility class는 최대 5개까지 인라인으로 사용하고, 복잡한 스타일은 `clsx` + 모듈화된 helper를 활용합니다. MUI 컴포넌트 override 시 테마(`src/shared/theme`)를 우선 수정하세요.
- **국제화(i18n)**: 모든 사용자 노출 문자열은 `src/shared/i18n` 리소스에 등록하고, key는 `feature.scope.action` 형식을 사용합니다.

## 테스트 및 품질 보증
- **Lint & Typecheck**: 기능 변경 시 `npm run lint`와 `npm run typecheck`를 필수로 실행합니다.
- **단위 테스트**: `vitest` 기반 테스트는 feature별 디렉토리에 위치시키고, Given-When-Then 패턴을 서술형 주석으로 남깁니다.
- **E2E 고려**: 렌더러 UI 변경 시 `docs/testing.md`의 스냅샷/시나리오 업데이트 여부를 확인합니다.
- **수동 검증**: Electron 관련 변경 후에는 `npm run electron:dev`로 기본 워크플로우(폴더 선택 → 명령 실행 → 로그 확인)를 직접 점검합니다.

## 커밋 및 PR 운영
- **커밋 규칙**: Conventional Commits(`feat:`, `fix:`, `docs:`, `refactor:`, `chore:` 등)를 사용하고, 본문에 변경 배경과 테스트 결과를 포함합니다.
- **PR 템플릿**: Summary에는 사용자 관점의 영향, Testing에는 실행한 스크립트와 결과를 bullet 형태로 기재합니다.
- **리뷰 체크리스트**:
  1. 설계 문서와 구현이 일치하는가?
  2. SOLID/KISS/YAGNI 원칙을 위반하지 않는가?
  3. 타입, 테스트, i18n 리소스가 최신 상태인가?
  4. 메인/렌더러 간 계약이 깨지지 않았는가?

## 협업 노트
- 변경 사항이 다른 기여자와 충돌할 여지가 있을 경우 `docs/decisions/`에 ADR을 추가하여 맥락을 공유합니다.
- 이 문서에 대한 업데이트는 팀 합의 후 진행하며, 새로운 규칙 도입 시 배경/사례/적용 범위를 명시하세요.
