# OpenAI Codex / Gemini CLI / Claude Code 기반 글쓰기 기능 도입 계획서

왜: 현재 앱은 Gemini CLI와 Claude Code 중심의 터미널 기반 상호작용을 제공하지만, 글쓰기(문서 초안/개요/리라이팅/톤 변환 등) 워크플로는 명시적으로 지원하지 않음. 또한 OpenAI(Codex/현행 OpenAI CLI) 연동이 부재하여 선택지 확장성과 i18n/설정 일관성 면에서 개선 여지가 큼. 본 계획은 1) OpenAI CLI 연동 추가, 2) “글쓰기 모드”를 기능으로 정식화, 3) IPC/타입/i18n/스토어/문서의 일관성 확보를 목표로 함.

기대 효과: 멀티 프로바이더 글쓰기 생산성 향상, 선택지 확장(OpenAI), IPC 계약 위반 감소, i18n/테마/스토어/문서의 일관성 강화, 리뷰 및 QA 효율 증가.

참조: README.md, AGENTS.md, docs/architecture.md, CLAUDE.md

---

## 현재 상태 요약(코드 기준)

- 런타임 분리: Electron(Main)/React(Renderer) + PTY 기반 터미널(xterm)
  - PTY: `src-electron/services/TerminalManager.ts:15` — gemini/claude 명령을 인터랙티브로 실행
  - CLI 확인: `src-electron/services/CliChecker.ts:11` — gemini/claude 설치/검사만 존재
  - IPC: `src-electron/ipcHandlers/*` — 디렉토리/파일/에이전트/앱 핸들러 분리
  - Preload: `src-electron/preload.ts:15` — `initializeAITool(workspaceDir, aiTool)` 등 노출(현재 `'gemini'|'claude'`)
- 렌더러(FSD):
  - 터미널: `src/features/terminal/ui/TerminalEngine.tsx:41` — 초기화 시 `window.electronAPI.initializeAITool()` 호출, `onTerminalData` 구독/해제 반환
  - 채팅 입력: `src/features/chat-input/*` — 파일/명령 자동완성, 입력 히스토리, 키 처리. 글쓰기 특화 명령은 부재
  - 인스트럭션 에디터: `src/features/instruction-editor/*` — `GEMINI.md`/`CLAUDE.md` 편집. 생성 IPC는 `.geminirc` 또는 `CLAUDE.md`라 명명 불일치 존재
  - 스토어: `src/stores/appStore.ts` — 탭/최근 폴더/테마. `aiTool` 유니온이 `'gemini'|'claude'`
- i18n: `src/shared/i18n/locales/*/translation.json` — 글쓰기 템플릿/명령 키는 아직 없음
- 문서: `docs/architecture.md` — PTY/xterm/IPC 개요, 멀티 워크스페이스. OpenAI 미언급

식별된 간극/이슈
- OpenAI(Codex/현행 OpenAI CLI) 미연동 → 타입/IPC/서비스/UI 확장 필요
- 인스트럭션 파일 생성 vs 편집 명명 불일치(`.geminirc` vs `GEMINI.md`) → 정책 일관화 필요(AGENTS 준수)
- 슬래시 명령어에 글쓰기 시나리오 부재(`/outline`, `/draft` 등) → 글쓰기 모드 도입 시 확장 필요

---

## 목표(글쓰기 모드 정의)

- 프로바이더: OpenAI(Codex/현행 OpenAI CLI), Gemini CLI, Claude Code 3종 선택
- 글쓰기 기능군:
  - 초안 생성: 주제/톤/길이/타겟 지정하여 마크다운 초안 생성
  - 개요 생성/확장: `/outline`, 섹션 확장 `/expand <section>`
  - 리라이팅/요약/톤 변환: `/rewrite`, `/summarize`, `/tone <style>`
  - 문서 관리: 워크스페이스 내 `docs/` 경로로 저장/열기, 초안 버전 관리(간단 이력)
  - 인스트럭션: 프로바이더별 프롬프트 정책 파일(OpenAI/Gemini/Claude 각각) 통일 명명 및 에디터

---

## 아키텍처/계약 영향(필수 동기화 대상)

- 타입 유니온 확장: `'gemini' | 'claude' | 'openai'`
  - `src-electron/types/index.ts`
  - `src/shared/types/electronAPI.ts`
  - `src/types/index.ts`
- IPC 채널: 기존 재사용(`initialize-ai-tool`, `send-message`, `send-terminal-command`, `onTerminalData`)
  - 결과(Result) 형태 유지: `{ success: boolean; error?: string }`
- Preload 노출: `initializeAITool(workspaceDir, aiTool)`의 aiTool 유니온 확장
- PTY 실행 커맨드: OpenAI CLI 실행 방식 정의(아래 구현 작업 참고)
- 인스트럭션 파일 정책 통일: `GEMINI.md`/`CLAUDE.md`/`OPENAI.md` + 선택적 `.toolrc` (고급 설정)
- i18n 네임스페이스: `writing.*`, `aiSelector.*` 확장, 에러/공통 키 보완

---

## 구현 작업(Phase by Phase)

### Phase 0. 사전 정합성 및 리팩토링(소규모)
- 디렉토리 IPC 중복 정리: `src-electron/ipcHandlers/directoryHandlers.ts`와 유사 구현 중복 확인 및 일관성(오류 메시지, 보호 경로) 유지
- 인스트럭션 생성/편집 명명 불일치 해결
  - 생성: `src-electron/ipcHandlers/fileSystemHandlers.ts:34` — `.geminirc` 대신 `GEMINI.md` 생성으로 변경 또는 둘 다 생성 옵션화
  - 편집: `src/features/instruction-editor/hooks/useInstructionFile.ts:78` — 파일명 정책 문서화 및 코드/문서 동기화

### Phase 1. 타입/IPC/Preload에 OpenAI 추가(계약 동기화)
- 타입 유니온 확장 및 공용 타입 동기화
  - `src/shared/types/electronAPI.ts:38, 69, 92` — `aiTool: 'gemini'|'claude'|'openai'`
  - `src/types/index.ts:14, 30` — `TabState.aiTool`, `RecentFolder.aiTool`
  - `src-electron/types/index.ts` — 필요 시 `ElectronAPI` 내부 주석/타입 정리
- Preload 확장
  - `src-electron/preload.ts:16,35` — `initializeAITool`, `createAIConfigFile` 시그니처에 `'openai'` 추가
- IPC 핸들러 그대로 사용(채널명 유지), 파라미터 유니온만 확장

### Phase 2. OpenAI CLI 지원(Service/PTY)
- CLI 검사/설치 로직 추가
  - `src-electron/services/CliChecker.ts`
    - `checkOpenAICliInstalled()`: `which openai`/`openai --version`
    - `installOpenAICli()`: 우선 `npm i -g openai` 시도, 실패 시 가이드 메시지(README 링크). 설치 확인 재실행
    - `checkCliTool()`/`ensureCliToolInstalled()`에 `'openai'` 분기 추가
- PTY 실행 커맨드 정의
  - `src-electron/services/TerminalManager.ts:56-58` — `aiTool==='openai'`일 때 실행 명령 결정
  - 권장: 인터랙티브 모드가 없는 경우 셸 래퍼를 통해 간이 REPL 구현
    - 예: `openai chat.completions.create -i` 또는 `openai responses.create -i` 지원 여부 확인 후 입력 파이프
    - 대안: `src-electron/services/OpenAIRepl.ts`(간단 래퍼)에서 표준 입력을 받아 한 줄 요청→응답 출력. PTY에는 래퍼 실행
  - 환경 변수/키: `OPENAI_API_KEY` 존재 검사 후 경고 출력(터미널에 안내)
- AgentService 연동
  - `src-electron/services/AgentService.ts:10,18` — `currentAiTool` 유니온 확장, `initialize()`에 `'openai'` 분기 추가

### Phase 3. AIToolSelector에 OpenAI 옵션 추가(렌더러 UI)
- `src/components/AIToolSelector.tsx` — 라디오 옵션 추가, i18n 문구(`aiSelector.openaiDescription`) 반영
- 최근 폴더 추천 연동(`recommendedTool==='openai'`), 색상/아이콘 지정
- i18n 리소스 확장: `src/shared/i18n/locales/{ko,en,ja}/translation.json`

### Phase 4. 글쓰기 모드(Feature) 도입
- 새 Feature 생성: `src/features/writing/{model,lib,ui}/index.ts`
  - model: 글쓰기 설정 타입(톤, 길이, 타겟, 언어), 템플릿 메타
  - lib: 프롬프트 합성기(utils), 파일 저장 헬퍼(`docs/` 경로로 저장)
  - ui: WritingPanel(설정 폼), TemplatePicker(블로그/에세이/기술문서), Actions(초안/개요/요약/리라이트 실행)
- 상태 관리
  - 전용 store(optional) 또는 `appStore` 확장(파일 300줄 원칙 고려해 별도 store 권장)
  - 선택자(export) 제공(AGENTS 원칙)
- 터미널 연계
  - Writing 액션 → 채팅 입력 또는 터미널에 명령 문자열 주입(`window.electronAPI.sendMessage`)
  - provider별 프롬프트 전개(각 인스트럭션 파일 내용 포함)

### Phase 5. 슬래시 명령/자동완성 확장(글쓰기 특화)
- 명령 추가: `src/features/chat-input/lib/slashCommands.ts`
  - 공통: `/outline`, `/draft`, `/rewrite`, `/summarize`, `/tone <style>`, `/expand <section>`
  - 프로바이더별 차별화 설명
- 자동완성: `src/features/chat-input/lib/useAutoComplete.ts` — 글쓰기 명령 후보/설명 노출

### Phase 6. 인스트럭션/설정 정책 통일
- 편집 대상
  - `GEMINI.md`, `CLAUDE.md`, `OPENAI.md` → Instruction Editor에서 선택적 탭 또는 현재 선택된 프로바이더 명으로 제목 표시
  - `src/features/instruction-editor/components/InstructionEditorModal.tsx:79` — 타이틀/파일명 로직에 `'openai'` 추가
- 생성 대상(IPC)
  - `src-electron/ipcHandlers/fileSystemHandlers.ts:34` — `create-ai-config-file`에서 `'openai'` 분기 추가 → `OPENAI.md` 초기 템플릿 생성
- 템플릿 내용(20줄 내): 각 프로바이더별 글쓰기 지침 공통 골격(톤/길이/구조/링크 정책 등)

### Phase 7. i18n/테마/스토어 동기화
- i18n 키 추가
  - `writing.*`(예: `writing.title`, `writing.actions.draft`, `writing.settings.tone`)
  - `aiSelector.openaiDescription`, `errors.openaiCli` 등
- 스토어 유니온/직렬화 점검
  - `src/stores/appStore.ts` — `RecentFolder.aiTool`, `TabState.aiTool`에 `'openai'` 포함, 마이그레이션 버전 증가 필요 시 조정

### Phase 8. 테스트/QA/문서
- 단위 테스트
  - 프롬프트 합성기, 파일 저장 헬퍼, 슬래시 명령 필터 로직
- 수동 검증 체크리스트(아래)로 E2E 흐름 수기 검증
- 문서/ADR
  - `docs/decisions/NNNN-add-openai-provider.md` — 계약/설치/보안 고려 기록
  - `docs/architecture.md` 업데이트: OpenAI CLI 상자 추가, 데이터 플로우 갱신
  - `README.md` 기능/지원 목록 갱신, `AGENTS.md` 인스트럭션 정책/네임스페이스 명시

---

## 구현 디테일(핵심 포인트)

- OpenAI CLI 실행 전략
  - 우선 순위: 네이티브 인터랙티브 제공 시 해당 명령 사용. 미제공 시 간이 REPL 래퍼(`OpenAIRepl.ts`) 만들어 PTY에 붙임
    - 입력 1줄 → `openai responses.create` 호출 → 마크다운 결과 출력 → `onData`로 터미널에 스트리밍(가능 시)
  - 키/환경: `OPENAI_API_KEY` 없으면 경고 출력 및 가이드 표시(링크는 README로)
- 인스트럭션 파일 정책
  - `.toolrc`류 설정은 “옵션”: 고급 설정 또는 모델/토큰 제한 등
  - 기본은 `{PROVIDER}.md` 인스트럭션를 에디터에서 관리(사용자 친화)
- 보안/런타임
  - Preload API 최소화 유지, `contextIsolation: true` 준수
  - 파일 삭제/열기 등 보호 경로 정책 유지(현행 로직 유지)

---

## 수동 검증 체크리스트(글쓰기 플로우)

1) 앱 실행 → 새 탭 기본 표시 확인
2) 폴더 선택 → AI 도구 선택에 OpenAI 표시/선택 가능
3) 선택한 폴더에 `{PROVIDER}.md` 템플릿 생성 확인(`GEMINI.md`/`CLAUDE.md`/`OPENAI.md`)
4) 터미널 초기화: 선택 도구가 정상 기동, `onTerminalData`로 출력 반영
5) ChatInput에 글쓰기 명령 자동완성(`/outline`, `/draft` 등) 노출/선택
6) `/outline` 실행 → 개요 수신 → `/draft` 실행 → 마크다운 초안 수신
7) WritingPanel에서 톤/길이/타겟 지정 후 초안 생성 → `docs/`에 저장
8) Instruction Editor에서 `{PROVIDER}.md` 수정 → 다음 초안 품질 반영 확인
9) OpenAI/Gemini/Claude 간 전환 및 동일 명령 결과 비교 확인
10) 멀티 탭/최근 폴더/북마크 동작 유지, i18n/테마/폰트 사이즈 영향 정상

---

## 리스크와 완화

- OpenAI CLI 인터랙티브 미지원 가능성 → 래퍼(REPL)로 우회, 후속에 네이티브 지원 시 교체
- 글로벌 설치 권한 문제(npm -g) → 실패 시 안내 문구 및 수동 설치 경로 제공, 로컬 실행 경로 지원 고려
- 인스트럭션 정책 변경에 따른 회귀 → ADR 작성 및 문서/코드 참조 링크 명시, 테스트 추가

---

## 변경 파일(예상)

- 메인/서비스/IPC
  - `src-electron/services/CliChecker.ts` — OpenAI 검사/설치 추가
  - `src-electron/services/TerminalManager.ts` — `'openai'` 명령 분기 및(필요 시) REPL 래퍼 호출
  - `src-electron/services/AgentService.ts` — 유니온 확장, 초기화 분기
  - `src-electron/ipcHandlers/fileSystemHandlers.ts` — `create-ai-config-file`에 `'openai'` 분기(OPENAI.md)
  - `src-electron/preload.ts` — API 시그니처 유니온 확장
- 렌더러/Feature/UI
  - `src/components/AIToolSelector.tsx` — OpenAI 옵션 추가
  - `src/features/chat-input/lib/slashCommands.ts` — 글쓰기 명령 추가
  - `src/features/writing/*` — 신규 Feature 스캐폴딩
  - `src/features/instruction-editor/*` — OPENAI.md 지원
  - `src/stores/appStore.ts`/`src/types/index.ts` — 유니온 확장/마이그레이션 버전 증가 여부 확인
- 타입/i18n/문서
  - `src/shared/types/electronAPI.ts`, `src/types/index.ts`, `src-electron/types/index.ts`
  - `src/shared/i18n/locales/{ko,en,ja}/translation.json`
  - `docs/architecture.md`, `README.md`, `docs/decisions/*`

---

## 다음 액션(작업 순서 제안)

1) Phase 1–2(계약/서비스)부터 착수 → 프로바이더 3종 구동 확보
2) AIToolSelector/i18n 반영 → 선택 UI 완성
3) 글쓰기 Feature 스캐폴딩 → 최소 `/outline`/`/draft` 동작
4) 인스트럭션 정책 통일/에디터 연동 → 품질 고정
5) QA/문서/ADR 정리 → 머지

검증 중 오류/누락 발견 시 `docs/decisions/`에 ADR 추가 후 타입/IPC/Preload/문서 링크로 상호 참조(AGENTS 원칙).

