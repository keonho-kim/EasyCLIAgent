# ADR NNNN: <제목을 여기에>

- Status: Proposed | Accepted | Rejected | Superseded by NNNN
- Date: YYYY-MM-DD
- Authors: @handle1, @handle2
- References: issues/#, PRs/#, docs links

## Context

- 배경/문제 정의
- 제약(보안/성능/호환성/플랫폼)

## Options Considered

- Option A: 요약
  - 장점 / 단점
- Option B: 요약
  - 장점 / 단점

## Decision

- 선택한 옵션과 근거

## Impacts

- IPC
  - 채널: 추가/변경/삭제 (예: `app/<domain>/<action>`, 레거시: `select-directory`, `fs:writeFile`)
  - 이벤트: `terminal:data`, `file-system-event` 구독/해제 규칙
  - 타입: 요청/응답 Result(`{ success, error? }`) 필드 변화
- Electron 보안
  - `contextIsolation`, `nodeIntegration`, CSP 변경
  - Preload 공개 API 변경(최소 표면 원칙)
- 상태/퍼시스트
  - Zustand 스토어 구조/키 변경, `persist` 버전 업 및 마이그레이션 계획
- i18n
  - 네임스페이스/키 정책 변화와 리소스 동기화(ko/en/ja)
- UI/테마
  - MUI 테마 토큰, Tailwind 사용 지침 영향
- 빌드/배포
  - Vite/Electron Builder 설정 변화, 산출물 영향

## Migration

- 단계별 적용 순서(코드/문서/배포)
- 다운그레이드/롤백 절차

## Testing

- 단위/통합/E2E 범위와 케이스
- 수동 검증 체크리스트(폴더 선택 → AI 초기화 → 메시지 전송 → 출력 확인)
- 성공 기준과 모니터링 포인트

## Open Questions

- 남은 리스크/추가 검토 항목
