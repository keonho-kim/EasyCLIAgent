# EasyCLIAgent

> 🤖 Gemini CLI와 Claude Code를 위한 현대적인 GUI 애플리케이션

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-191970?logo=Electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

EasyCLIAgent는 Gemini CLI와 Claude Code를 위한 직관적이고 현대적인 데스크톱 GUI 애플리케이션입니다. 터미널 인터페이스를 통해 AI 어시스턴트와 상호작용하며, 실시간으로 작업 로그와 대화 내용을 시각적으로 확인할 수 있습니다.

## ✨ 주요 기능

### 🚀 **멀티 워크스페이스**

- 탭 기반으로 여러 프로젝트 동시 작업
- 독립적인 AI 도구 세션 관리
- 워크스페이스별 설정 분리

### 🤖 **AI 도구 통합**

- **Gemini CLI**: Google의 강력한 코드 이해 AI
- **Claude Code**: Anthropic의 뛰어난 추론 AI
- 자동 설치 및 버전 관리
- 통합된 터미널 인터페이스

### 💬 **스마트 입력 시스템**

- **파일 자동완성**: `@src/App.tsx` - 프로젝트 파일 탐색
- **명령어 자동완성**: `/create`, `/explain` - AI 명령어 지원
- **입력 히스토리**: ↑/↓ 키로 이전 입력 탐색
- **IME 지원**: 한국어, 일본어 등 복합 문자 입력
- **키보드 단축키**: 효율적인 작업 흐름

### 📊 **실시간 터미널 관리**

- AI 도구와의 실시간 통신
- 터미널 출력 캡처
- 명령 실행 및 결과 처리

### 📁 **프로젝트 관리**

- 최근 폴더 관리 및 북마크
- 프로젝트 설명 편집
- 액세스 카운트 추적
- AI 도구 추천 (이전 사용 기록 기반)

### 🎨 **모던 UI/UX**

- Material-UI 기반 반응형 인터페이스
- 다크/라이트 테마 전환
- 터미널 폰트 크기 조정
- 다국어 지원 (한국어, 영어, 일본어)

## 🛠 기술 스택

### Core Framework

- **Electron** - 크로스 플랫폼 데스크톱 애플리케이션
- **React 18** - 최신 React features (Concurrent, Suspense)
- **TypeScript** - 타입 안전성과 개발자 경험
- **Vite** - 빠른 개발 서버와 번들링

### UI/UX

- **Material-UI (MUI) v5** - Google Material Design
- **TailwindCSS** - 유틸리티 우선 CSS
- **Framer Motion** - 애니메이션과 전환 효과
- **xterm.js** - 브라우저 기반 터미널

### State & Data

- **Zustand** - 경량 상태 관리
- **React i18next** - 다국어 지원
- **node-pty** - PTY (Pseudo Terminal) 지원
- **Chokidar** - 파일 시스템 감시

## 🚀 빠른 시작

### 사전 요구사항

- Node.js 18+
- npm 8+ 또는 yarn 1.22+

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/your-username/EasyCLIAgent.git
cd EasyCLIAgent

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

### 사용법

1. **프로젝트 폴더 선택** - 작업할 디렉토리 선택
2. **AI 도구 선택** - Gemini 또는 Claude 선택  
3. **AI와 대화** - 채팅 입력창에서 질문하기

```bash
# 파일 참조하기
@src/App.tsx 이 파일을 분석해주세요

# 슬래시 명령어 사용
/create component UserProfile

# 일반 질문
이 프로젝트의 구조를 설명해주세요
```

## 🏗 아키텍처

EasyCLIAgent는 **Feature-Sliced Design** 아키텍처를 따르며, **SOLID 원칙**을 엄격히 준수합니다.

```
├── src/                    # 프론트엔드 (React)
│   ├── features/          # 기능별 모듈
│   │   ├── chat-input/    # 채팅 입력
│   │   ├── terminal/      # 터미널 인터페이스
│   │   └── instruction-editor/ # 설정 에디터
│   ├── shared/            # 공유 리소스
│   └── stores/            # 상태 관리
├── src-electron/           # 백엔드 (Electron)
│   ├── services/          # 비즈니스 서비스
│   └── ipcHandlers/       # IPC 통신
└── docs/                  # 개발 문서
```

### 핵심 원칙

- **Single Responsibility**: 각 컴포넌트는 하나의 책임만
- **300줄 제한**: 모든 파일은 300줄 이내
- **타입 안전성**: TypeScript strict 모드
- **테스트 주도**: 모든 기능에 테스트 코드

## 📚 문서 맵

- `docs/README.md` — 문서 인덱스
  - 언제: 프로젝트 전반을 빠르게 훑고 어디를 더 볼지 결정할 때

- `docs/development-setup.md` — 개발 환경 설정/스クリپ트/빌드
  - 언제: 처음 환경 구성, Node/Electron 버전 변경, 빌드/런타임 오류 발생 시

- `docs/architecture.md` — 시스템 설계(메인/렌더러 분리, IPC, PTY, FSD)
  - 언제: IPC 채널/타입 추가·변경, 터미널/서비스 계층 수정, 신규 feature의 경계 정의가 필요할 때

- `AGENTS.md` — 저장소 에이전트 운영 가이드(필수 규칙)
  - 언제: 코드 구조/IPC 계약/i18n/스타일/테스트 원칙 확인 및 변경 전 체크리스트가 필요할 때

- `CLAUDE.md` — 확장된 개발 가이드와 베스트 프랙티스
  - 언제: SOLID/KISS/YAGNI 원칙, 컴포넌트/상태/IPC/성능 최적화 패턴을 자세히 보고 싶을 때

- `docs/decisions/` — ADR(결정 기록) 폴더(필요 시 생성)
  - 언제: 계약/구조에 영향 있는 설계 결정을 도입하거나 변경 맥락을 공유해야 할 때

- 예정
  - `docs/testing.md` — E2E/스냅샷/시나리오 가이드(추가 예정, 현재는 README와 AGENTS의 수동 검증 섹션 참고)

## 🧭 결정 기록(ADR)

- 무엇: 주요 설계 결정을 기록하는 Architecture Decision Records
- 위치: `docs/decisions/`
  - 가이드: `docs/decisions/README.md`
  - 템플릿: `docs/decisions/adr-template.md`
- 파일명 규칙: `NNNN-kebab-title.md` (예: `0001-ipc-channel-naming.md`)
- 언제 작성하나
  - IPC 계약(채널/Result 타입/이벤트) 변경
  - Preload/Electron 보안(Context Isolation/CSP/API 표면) 변경
  - Zustand 스토어/퍼시스트 구조·마이그레이션 변경
  - i18n 키/네임스페이스 정책 변경
  - 빌드/배포 체인(Electron/Vite/electron-builder) 변경
  - 터미널/CLI 통합(node-pty/xterm, Gemini/Claude 초기화) 변경
  - UI/테마(MUI 토큰, Tailwind 한도, 접근성) 정책 변경

## 🧪 개발

### 개발 명령어

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 테스트
npm run test
npm run test:ui

# 코드 품질
npm run lint
npm run typecheck
```

### 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'feat: add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

자세한 내용은 [개발 환경 설정](./docs/development-setup.md)을 참조하세요.

## 📋 개발 상태

### 완료된 기능 ✅

- [x] 멀티 탭 워크스페이스
- [x] AI 도구 연동 (Gemini CLI, Claude Code)
- [x] 파일/명령어 자동완성
- [x] 실시간 터미널 관리
- [x] 다국어 지원
- [x] 테마 시스템
- [x] 프로젝트 북마크

### 개발 중인 기능 🚧

- [ ] E2E 테스트 슈트
- [ ] 성능 최적화
- [ ] 플러그인 시스템
- [ ] 클라우드 동기화

### 계획된 기능 📋

- [ ] 다른 AI 모델 지원
- [ ] 커스텀 테마
- [ ] 출력 내보내기
- [ ] 음성 입력

## 🤝 커뮤니티

### 버그 신고 및 기능 요청

[GitHub Issues](https://github.com/your-username/EasyCLIAgent/issues)에서 버그를 신고하거나 새로운 기능을 제안해주세요.

### 토론

[GitHub Discussions](https://github.com/your-username/EasyCLIAgent/discussions)에서 질문하고 아이디어를 공유하세요.

## 📄 라이선스

이 프로젝트는 [MIT License](./LICENSE) 하에 배포됩니다.

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들에 영감을 받았습니다:

- [Gemini CLI](https://github.com/google/gemini-cli) - Google의 AI CLI 도구
- [Claude Code](https://github.com/anthropics/claude-code) - Anthropic의 AI 개발 도구

---

**EasyCLIAgent와 함께 더 스마트한 개발 경험을 시작하세요!** 🚀
