# Repository Agent Guide

## Scope

이 문서는 EasyCLIAgent 저장소 전체에 적용되는 에이전트 운영 지침입니다. 하위 폴더에 별도의 `AGENTS.md`가 존재할 경우, 해당 문서의 규칙이 우선합니다.

## 문서 목적 및 기대 효과

- 왜: README, CLAUDE.md, docs/* 전반에 흩어진 규칙을 한 곳에서 실행 가능하게 정리하여, 기여자가 안전하게 변경하고 빠르게 검증하도록 돕습니다.
- 기대 효과: 변경 속도 향상, IPC 계약 위반 감소, i18n/테마/스토어 일관성 확보, 리뷰 효율성 향상.
- 참고 문서: `README.md`, `CLAUDE.md`, `docs/architecture.md`, `docs/development-setup.md`.

## 문서 맵(무엇을 언제 볼까)

- `docs/README.md` — 문서 인덱스와 네비게이션
  - 언제: 새로 합류했거나, 어느 문서를 먼저 읽을지 결정할 때

- `docs/development-setup.md` — 로컬 개발 환경, 스크립트, 빌드/패키징
  - 언제: 초기 세팅, 의존성/런타임 버전 업그레이드, 빌드 실패/실행 오류 트러블슈팅 시

- `docs/architecture.md` — 아키텍처, 프로세스 경계, IPC, PTY, FSD 계층
  - 언제: IPC 채널/타입 추가·변경, 터미널/서비스 계층 리팩토링, feature 경계/공용 타입 정의가 필요한 경우

- `AGENTS.md` — 실무 운영 규칙(본 문서)
  - 언제: 변경 전 체크리스트, 타입/채널 동기화, i18n/테마/스토어 원칙 확인 시

- `CLAUDE.md` — 패턴/베스트 프랙티스/코딩 원칙 상세
  - 언제: SOLID/KISS/YAGNI, 상태/컴포넌트/성능 최적화 패턴 레퍼런스가 필요할 때

- `docs/decisions/` — ADR 보관소(없으면 생성)
  - 언제: 계약/공용 타입/보안/성능에 영향을 주는 결정을 남겨야 할 때

- 예정 문서
  - `docs/testing.md` — E2E/스냅샷/시나리오(추가 예정). 현재는 아래 “테스트와 품질 보증” 섹션의 수동 검증 체크리스트를 따르세요.

## 프로젝트 이해

- 핵심 목표: Gemini CLI와 Claude Code를 GUI로 통합하여 멀티 워크스페이스를 지원하는 생산성 도구를 제공합니다. (참고: README.md)
- 런타임 분리: `src`는 React/Vite 기반 렌더러, `src-electron`은 Electron 메인 프로세스 로직을 담당합니다. 경로를 넘나드는 변경 시 IPC 계약을 반드시 검토하십시오. (참고: docs/architecture.md)
- Feature-Sliced Design: `components/`, `features/`, `shared/`, `stores/`, `utils/` 구조를 준수하고, 새로운 기능은 `features/<feature-name>`로 구성합니다. (참고: CLAUDE.md, docs/architecture.md)

## 작업 원칙(문서 스타일 포함)

- 언어 스타일: 기본 서술은 한국어, 기술 용어/코드/명칭은 영어 원문을 유지. 톤은 `README.md`, `CLAUDE.md`를 준수합니다.
- 구조화: Heading과 bullet로 요약 → 상세 → 예시 순서. 코드 예시는 Typescript 20줄 내외, 함수형 컴포넌트/Zustand 패턴을 반영합니다.
- 참조 연결: 기능/설계 변경 시 `docs/architecture.md`, `CLAUDE.md`, 관련 README 섹션을 링크합니다. 가능하면 상대 경로를 명기합니다.
- 변경 이유 명시: “왜”와 기대 효과를 간단히 첨부합니다.

## 런타임 경계와 IPC 계약

- 경계 규칙: 렌더러(`src`)에서 Node API 직접 접근 금지. 반드시 `src-electron/preload.ts`를 통해 노출된 safe API(`window.electronAPI`)만 사용합니다.
- 타입 동기화: 다음 파일 간 시그니처/채널/페이로드를 동기화합니다.
  - `src-electron/types/index.ts`
  - `src/shared/types/electronAPI.ts`
  - `src/types/index.ts` (렌더러 전역/스토어에서 공유 시)
- 채널 네이밍: 기존 채널은 하이픈/콜론 기반(`select-directory`, `fs:writeFile`, `terminal:data`). 신규 추가 시 `app/<domain>/<action>` 패턴을 권장합니다. 점진적 마이그레이션 대상이며, 추가 시 두 패턴 간 충돌을 피하고 상수화하여 사용하세요.
- 이벤트 채널: 렌더러 구독 해제 필수. 예: `terminal:data`, `file-system-event` 구독 시 cleanup 반환 함수를 반드시 호출합니다.
- Preload 계약: contextIsolation=true를 유지하고, 필요한 API만 최소 권한으로 노출합니다.

예시: Preload에 안전하게 API 추가 (발췌, 단축)

```ts
// src-electron/preload.ts (요지)
const { contextBridge, ipcRenderer } = require('electron');

const electronAPI = {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getAppConfig: () => ipcRenderer.invoke('get-app-config'),
  onTerminalData: (cb: (d: string) => void) => {
    const l = (_: unknown, d: string) => cb(d);
    ipcRenderer.on('terminal:data', l);
    return () => ipcRenderer.removeListener('terminal:data', l);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
```

추가 IPC 핸들러 절차

- 타입 정의 추가: `src/shared/types/electronAPI.ts`에 요청/응답 타입 정의
- 메인 등록: `src-electron/ipcHandlers/<domain>Handlers.ts`에 `ipcMain.handle` 추가
- Preload 노출: `src-electron/preload.ts`에 `ipcRenderer.invoke`/리스너 추가
- 렌더러 사용: `window.electronAPI` 타입을 통해 호출, 구독 해제 포함
- 문서화: 이 섹션에 채널/타입을 1줄로 요약 링크 추가

## 아키텍처(요약)

- 큰 그림: Electron(Main)/React(Renderer)/AI CLI(외부)로 구성. PTY(node-pty)로 터미널을 연결하고 xterm.js로 렌더링합니다. (참고: docs/architecture.md)
- 디렉토리: `src-electron/ipcHandlers`, `src-electron/services`, `src/features/*`, `src/stores`, `src/shared/*`를 준수.
- FSD: feature는 `model/lib/ui`로 구성, `index.ts`로 public API를 노출합니다. (참고: CLAUDE.md)

## 상태 관리(Zustand)

- 원칙: 도메인별 스토어 분리, selector 기반 구독으로 리렌더 최소화, persist 사용 시 민감정보 제외.
- 저장소: `src/stores/*` 및 feature 전용 store는 해당 feature 디렉토리에 배치합니다.
- 셀렉터: `selectFoo(state)` 형태로 별도 export하여 재사용합니다.

예시: 도메인 스토어와 셀렉터 (단축)

```ts
// src/stores/uiStore.ts (유사 패턴)
import { create } from 'zustand';

type UI = { theme: 'dark'|'light'; setTheme: (t:UI['theme'])=>void };
export const useUIStore = create<UI>((set)=>({
  theme: 'dark',
  setTheme: (theme) => set((s)=>({ ...s, theme })),
}));

export const selectTheme = (s: UI) => s.theme;
```

## UI/스타일 가이드

- MUI 우선: 복잡한 스타일은 테마 기반으로 구성하고, Tailwind는 최대 5개 utility class만 인라인 사용. 복잡한 조합은 `clsx` 또는 helper로 분리.
- 테마 위치: 전역 테마는 `src/main.tsx`에서 `createTheme`로 정의. 터미널 색상은 `src/utils/themeUtils.ts` 및 `features/terminal/lib/terminalConfig.ts` 참고.
- 접근성: 포커스/키보드 탐색을 보장하고, 테마 대비를 유지합니다.

예시: 전역 MUI 테마 스켈레톤

```ts
// src/main.tsx (요지)
const theme = createTheme({
  palette: { mode: 'dark', primary: { main: '#4285f4' } },
});
```

## 국제화(i18n)

- 리소스 경로: `src/shared/i18n/locales/{en,ko,ja}/translation.json`.
- 키 네임스페이스: 공통/오류는 `common.*`, `errors.*`; 기능은 현재 사용 중인 네임스페이스(`terminal.*`, `directoryBrowser.*`, `instruction.*`, `aiSelector.*`, `commands.*`, `tabs.*`)를 유지합니다. 신규 기능은 `featureName.*`로 추가하세요.
- 사용 규칙: 사용자 노출 문자열은 모두 리소스에 등록하고, 컴포넌트에서는 `useTranslation()`으로 참조합니다.

예시: 컴포넌트 내 번역 사용

```tsx
import { useTranslation } from 'react-i18next';

const Placeholder = () => {
  const { t } = useTranslation();
  return <input placeholder={t('terminal.placeholder')} />;
};
```

## 비동기/에러 처리

- 기본: `async/await` 사용. IPC 반환 타입은 `success: boolean`과 `error?: string`을 포함하는 Result 형태를 권장합니다.
- 예외: 메인에서 발생한 예외를 그대로 렌더러로 throw하지 말고 에러 메시지로 매핑하여 반환합니다.
- 커스텀 에러: 컨텍스트를 담은 Error 클래스로 래핑해 로그/디버깅을 돕습니다. (참고: CLAUDE.md의 예시)

예시: 안전한 Result 반환 (단축)

```ts
ipcMain.handle('send-message', async (_, msg: string) => {
  try { return { success: agent.sendMessage(msg) }; }
  catch (e) { return { success:false, error: e instanceof Error? e.message:'send failed' }; }
});
```

## 테스트와 품질 보증

- Lint/Typecheck: `npm run lint`, `npm run typecheck`
- 단위 테스트: `vitest` 사용. feature별 디렉토리에 테스트를 배치하고 Given-When-Then을 주석으로 기술합니다. 예: `features/<feature>/__tests__/...` 또는 `src/test/*`.
- UI 변경: 스냅샷/E2E 문서는 추후 `docs/testing.md`로 정리 예정. 현재는 수동 검증 체크리스트를 따릅니다.
- 수동 검증(중요):
  - 개발 실행: `npm run dev` (렌더러) — Electron은 dev 환경에서 `vite-plugin-electron` 구성에 따라 로드됩니다.
  - 기본 흐름: 폴더 선택 → AI 도구 초기화 → 메시지 전송 → 터미널 데이터 표시 확인
  - IPC/이벤트: 구독/해제, 에러 핸들링, 권한 범위 점검

## 개발/빌드/배포 명령

- 개발: `npm run dev`
- 빌드(앱): `npm run build` / 디렉토리 산출물 `npm run build:dir`
- 미리보기: `npm run preview`
- 테스트: `npm run test`, `npm run test:ui`, `npm run test:coverage`
- 품질: `npm run lint`, `npm run lint:fix`, `npm run typecheck`

## PR/커밋 운영

- 커밋 규칙: Conventional Commits(`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`). 본문에 변경 배경(왜)과 테스트 결과를 포함합니다.
- PR 템플릿 요지:
  - Summary: 사용자 관점 영향(+ 전환 비용)
  - Design: 변경된 구조/계약 핵심 요약(링크 포함)
  - Testing: 실행 스크립트와 결과(스크린샷/로그)
  - Risks: IPC/보안/성능 리스크 및 완화책
- 리뷰 체크리스트:
  1) 설계 문서와 구현이 일치하는가? (`docs/architecture.md`)
  2) SOLID/KISS/YAGNI 원칙을 위반하지 않는가? (파일 300줄 이하 유지)
  3) 타입/테스트/i18n 리소스가 최신 상태인가?
  4) 메인/렌더러 간 계약이 깨지지 않았는가? (채널/타입 동기화)
  5) 구독 해제/리소스 정리가 누락되지 않았는가?

## 결정 기록(ADR) 요약

- 위치: `docs/decisions/` — 가이드 `docs/decisions/README.md`, 템플릿 `docs/decisions/adr-template.md`
- 파일명: `NNNN-kebab-title.md` (예: `0001-ipc-channel-naming.md`)
- 언제 작성하나
  - IPC 계약 변경(채널/Result 타입/이벤트 구독 규칙)
  - Preload/Electron 보안 변경(Context Isolation/CSP/API 표면)
  - Zustand 스토어/퍼시스트 구조 및 마이그레이션 변경
  - i18n 키/네임스페이스 정책 변경, 리소스 구조 개편
  - 빌드/배포 체인(Electron/Vite/electron-builder) 변경
  - 터미널/CLI 통합 정책(node-pty/xterm, Gemini/Claude 초기화) 변경
  - UI/테마(MUI 토큰, Tailwind 한도, 접근성) 정책 변경
- 절차
  1) 템플릿 복제 후 Proposed로 작성 → 코드/문서 교차 수정
  2) 관련 타입/핸들러/Preload/문서(AGENTS/architecture/README) 링크 추가
  3) PR에 ADR 포함, 머지 시 Status를 Accepted로 갱신

## Agent 작업 플레이북(자주 하는 변경)

- 신규 IPC 추가
  - 타입 → 핸들러 → Preload → 렌더러 호출 → 문서/체크
- 신규 Feature 추가
  - `features/<name>/{model,lib,ui}` 스캐폴딩 → 상태/셀렉터 → i18n → 테스트 → 문서
- UI 텍스트 변경
  - `translation.json` 키 추가 → 컴포넌트 적용 → 세 언어 동기화 → 스크린샷/검증
- 멀티 워크스페이스 로직 변경
  - `src/stores/appStore.ts` 셀렉터/액션 업데이트 → 탭 활성 흐름 재검증 → 회귀 테스트

## 보안 가이드(요지)

- Electron: `contextIsolation: true`, `nodeIntegration: false` 유지, CSP는 dev/prod 상이(참고: `src-electron/windowManager.ts`).
- 입력/경로: 사용자 입력/파일 경로 검증 및 보호 경로 삭제 금지(참고: `directoryHandlers.ts`).
- 노출 최소화: Preload에서 필요한 API만 whitelisting.

## 변경 기록

- 2025-10-23: README/CLAUDE/docs 통합 개정
  - 왜: 흩어진 규칙으로 인한 계약 위반/중복 구현 감소 필요
  - 효과: IPC 타입 동기화와 i18n/테마/스토어 일관성 강화를 위한 단일 기준 제공

## 협업 노트

- 변경 사항이 다른 기여자와 충돌할 여지가 있을 경우 `docs/decisions/`에 ADR을 추가하여 맥락을 공유합니다. (디렉토리가 없으면 생성하세요.)
- 이 문서 업데이트는 팀 합의 후 진행하며, 새로운 규칙 도입 시 배경/사례/적용 범위를 명시합니다.
