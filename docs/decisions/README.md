# Architecture Decision Records (ADR)

본 디렉토리는 EasyCLIAgent의 중요한 설계 결정을 기록(ADR)하는 곳입니다. 계약(IPC/타입), 보안, 데이터/스토어 구조, 빌드/배포, UX에 영향을 주는 변경을 투명하게 남겨 팀 합의를 돕고 회귀를 예방합니다.

## 언제 ADR을 작성하나요?

- IPC 계약 변경
  - 채널 추가/제거/리네이밍, 페이로드/Result 타입 변경, 이벤트 채널 구독/해제 규칙 변경
- Preload/Electron 보안 변경
  - `contextIsolation`, `nodeIntegration`, CSP, 공개 API 표면 변경
- 데이터/상태/퍼시스트 변경
  - Zustand 스토어 구조 변경, `persist` 버전 마이그레이션, 저장 키/네임스페이스 변경
- i18n/키 네이밍 정책 변경
  - 네임스페이스/키 패턴 변경, 언어 리소스 구조 개편
- 런타임/빌드 체인 변경
  - Electron/Vite/electron-builder 설정, 번들 전략(코드 분할/압축/자산 처리)
- 터미널/CLI 통합 변경
  - `node-pty`/xterm 통합 방식, Gemini/Claude 초기화/버전 관리 정책
- UX/테마 가이드라인 변경
  - MUI 테마 토큰, Tailwind 사용 한도, 접근성/포커스 정책

## 파일명 규칙

- `NNNN-kebab-title.md` (4자리 일련번호 + 요약 제목)
- 예: `0001-ipc-channel-naming.md`

## 상태(Status)

- Proposed → Accepted/Rejected → Superseded
- Superseded 시 상호 링크를 추가합니다.

## 작성 절차

- 템플릿 복제: `docs/decisions/adr-template.md`를 기반으로 새 파일 생성
- 관련 문서/코드 교차수정:
  - 타입: `src-electron/types/index.ts`, `src/shared/types/electronAPI.ts`, `src/types/index.ts`
  - 핸들러/Preload: `src-electron/ipcHandlers/*`, `src-electron/preload.ts`
  - 문서: `AGENTS.md`, `docs/architecture.md`, `README.md` 문서 맵/링크 업데이트
- PR에 ADR 파일 포함, Summary/Design/Testing 섹션에 ADR 링크 추가

## 최소 포함 항목

- 배경(Context)과 문제 정의
- 고려한 대안(Options)과 트레이드오프
- 결정(Decision)과 근거
- 영향(Impacts)
  - IPC 채널/타입, 보안 설정, 스토어/퍼시스트, i18n, 빌드, UX
- 마이그레이션(Migration)과 롤백(Rollback)
- 테스트/검증(Testing) 계획과 완료 기준
- 링크(관련 이슈/PR/문서)

## 예시 커밋 메시지

```
docs(decisions): add ADR 0001 for IPC channel naming

- define app/<domain>/<action> for new channels
- keep legacy hyphen/colon channels; deprecate with migration steps
- update AGENTS.md + architecture cross-refs
```

## 예시가 유용한 주제

- IPC 채널 네이밍 정책 정립/마이그레이션
- Preload API 표면 축소/권한 위임 변경
- `persist` 버전 업과 스토어 스키마 개편 가이드
- CSP 정책 상향과 외부 리소스 허용 도메인 변경
- 터미널 구성(테마/폰트/성능) 표준화
