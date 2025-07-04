# EasyCLIAgent - AI CLI 도구 GUI 프로젝트

## 프로젝트 개요

EasyCLIAgent는 Gemini CLI와 Claude Code를 위한 현대적인 GUI 애플리케이션입니다. 사용자가 디렉토리를 선택하고 터미널 인터페이스를 통해 AI 어시스턴트와 상호작용할 수 있으며, 실시간으로 작업 로그와 대화 내용을 시각적으로 확인할 수 있습니다.

## 핵심 프로그래밍 원칙

이 프로젝트는 다음 핵심 원칙들을 엄격히 준수합니다:

### SOLID 원칙
- **SRP (Single Responsibility Principle)**: 각 클래스/컴포넌트는 단 하나의 책임만 가집니다
- **OCP (Open/Closed Principle)**: 확장에는 열려있고 수정에는 닫혀있습니다
- **LSP (Liskov Substitution Principle)**: 하위 타입은 상위 타입을 완전히 대체할 수 있습니다
- **ISP (Interface Segregation Principle)**: 클라이언트는 사용하지 않는 인터페이스에 의존하지 않습니다
- **DIP (Dependency Inversion Principle)**: 추상화에 의존하며 구체화에 의존하지 않습니다

### 코딩 표준
- **KISS**: 단순함을 유지하며 불필요한 복잡성을 피합니다
- **YAGNI**: 현재 필요하지 않은 기능은 구현하지 않습니다
- **DRY**: 코드 중복을 최소화합니다
- **파일 크기 제한**: 모든 파일은 300줄을 초과하지 않습니다

## 기술 스택

### Core Framework & Runtime
- **Electron**: 크로스 플랫폼 데스크톱 애플리케이션
- **TypeScript**: 타입 안전성과 개발자 경험 향상
- **React 18**: 최신 React features (Concurrent features, Suspense)
- **Vite**: 빠른 개발 서버와 번들링

### UI/UX Libraries
- **Material-UI (MUI) v5**: Google Material Design 기반 컴포넌트
- **TailwindCSS**: 유틸리티 우선 CSS 프레임워크
- **Framer Motion**: 애니메이션과 전환 효과
- **xterm.js**: 브라우저 기반 터미널 에뮬레이터

### State Management & Data
- **Zustand**: 경량 클라이언트 상태 관리
- **Zustand Persist**: 상태 영구 저장
- **React i18next**: 다국어 지원

### Terminal & AI Integration
- **node-pty**: PTY (Pseudo Terminal) 지원
- **Chokidar**: 파일 시스템 감시

## 아키텍처 패턴: Feature-Sliced Design (FSD)

```
src/
├── components/           # 공통 UI 컴포넌트
├── features/            # 독립적인 비즈니스 기능
│   ├── chat-input/     # 채팅 입력 기능
│   ├── instruction-editor/ # 설정 에디터
│   └── terminal/       # 터미널 인터페이스
├── shared/             # 공유 리소스
│   ├── hooks/         # 커스텀 훅
│   ├── i18n/          # 다국어 지원
│   └── types/         # 타입 정의
├── stores/            # 상태 관리
└── utils/             # 유틸리티 함수

src-electron/
├── ipcHandlers/       # 도메인별 IPC 핸들러
├── services/          # 비즈니스 서비스
├── types/             # 타입 정의
└── windowManager.ts   # 윈도우 관리
```

## 주요 기능

### 1. 멀티 워크스페이스
- 탭 기반으로 여러 프로젝트 동시 작업
- 독립적인 AI 도구 세션 관리
- 워크스페이스별 설정 분리

### 2. AI 도구 연동
- **Gemini CLI**: Google의 AI 어시스턴트 (gemini-cli)
- **Claude Code**: Anthropic의 AI 어시스턴트 (claude-code)
- 자동 설치 및 버전 관리
- 통합된 터미널 인터페이스

### 3. 스마트 입력 시스템
- **자동완성**: `@` 파일/폴더, `/` 명령어
- **입력 히스토리**: 방향키로 이전 입력 탐색
- **IME 지원**: 한국어, 일본어 등 복합 문자 입력
- **키보드 단축키**: 효율적인 작업 흐름

### 4. 실시간 터미널 관리
- AI 도구와의 실시간 통신
- 터미널 출력 캡처
- 명령 실행 및 결과 처리

### 5. 프로젝트 관리
- 최근 폴더 관리 및 북마크
- 프로젝트 설명 편집
- 액세스 카운트 추적
- AI 도구 추천 (이전 사용 기록 기반)

### 6. 설정 및 커스터마이징
- 다크/라이트 테마 전환
- 터미널 폰트 크기 조정
- 다국어 지원 (한국어, 영어, 일본어)
- 로그 레벨 설정

## 개발 가이드라인

### 컴포넌트 설계 원칙
```typescript
// ✅ Good: 단일 책임 원칙
const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <MessageContainer>
      <MessageContent content={message.content} />
      <MessageTimestamp timestamp={message.timestamp} />
    </MessageContainer>
  );
};

// ❌ Bad: 여러 책임을 가짐
const ChatDashboard: React.FC = () => {
  // 메시지 로딩, 전송, UI 렌더링, 상태 관리 등 모든 것을 처리
};
```

### 상태 관리 패턴
```typescript
// ✅ Good: 도메인별 스토어 분리
const useAppStore = create<AppState>(...);
const useTerminalStore = create<TerminalState>(...);
const useUIStore = create<UIState>(...);

// ❌ Bad: 모든 상태를 하나의 스토어에
const useGlobalStore = create<AllState>(...);
```

### IPC 통신 패턴
```typescript
// ✅ Good: 타입 안전한 IPC
interface ElectronAPI {
  selectDirectory: () => Promise<DirectorySelectResult>;
  sendMessage: (message: string) => Promise<TerminalCommandResult>;
}

// 핸들러는 도메인별로 분리
setupDirectoryHandlers();
setupAgentHandlers();
setupFileSystemHandlers();
```

### 에러 처리 패턴
```typescript
// ✅ Good: 체계적인 에러 처리
export class AgentServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AgentServiceError';
  }
}
```

## 테스트 전략

### 테스트 구조
```typescript
// Given-When-Then 패턴 사용
describe('ChatInput Component', () => {
  it('should handle Enter key to send message', () => {
    // Given
    const mockOnSend = jest.fn();
    const { getByRole } = render(
      <ChatInput onSendMessage={mockOnSend} workspaceDir="/test" />
    );

    // When
    const input = getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test message' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Then
    expect(mockOnSend).toHaveBeenCalledWith('test message');
  });
});
```

## 성능 최적화

### React 최적화
```typescript
// ✅ Good: React.memo와 useMemo 적절한 사용
const TerminalOutput = React.memo<TerminalOutputProps>(({ output }) => {
  const formattedOutput = useMemo(() => {
    return formatTerminalOutput(output);
  }, [output]);

  return <div>{formattedOutput}</div>;
});
```

### 가상화 활용
```typescript
// 대량 데이터 처리시 가상화 사용
const TerminalLogList: React.FC<{ logs: TerminalLog[] }> = ({ logs }) => {
  return (
    <FixedSizeList
      height={600}
      itemCount={logs.length}
      itemSize={24}
      itemData={logs}
    >
      {TerminalLogRenderer}
    </FixedSizeList>
  );
};
```

## 보안 고려사항

### Electron 보안
- **Context Isolation**: 렌더러와 메인 프로세스 분리
- **Preload Script**: 안전한 API 노출
- **CSP (Content Security Policy)**: XSS 방지
- **Node Integration**: 비활성화

### 데이터 보안
- 사용자 입력 검증
- 파일 경로 검증
- 프로세스 권한 최소화

## 개발 명령어

```bash
# 개발 서버 시작
npm run dev

# 빌드
npm run build

# 린트 및 포맷팅
npm run lint
npm run lint:fix

# 타입 체크
npm run typecheck

# 테스트
npm run test
npm run test:ui
npm run test:coverage
```

## 배포

```bash
# 프로덕션 빌드
npm run build

# 플랫폼별 바이너리 생성
npm run build:dir  # 폴더로 빌드
npm run dist       # 설치 파일 생성
```

## 기여 가이드라인

1. **코딩 표준 준수**: ESLint, Prettier 설정 따르기
2. **타입 안전성**: TypeScript strict 모드 준수
3. **테스트 작성**: 새 기능에 대한 테스트 포함
4. **문서화**: 복잡한 로직에 대한 주석 작성
5. **커밋 메시지**: 명확하고 설명적인 커밋 메시지

## 문제 해결

### 일반적인 문제
1. **캐시 문제**: `rm -rf node_modules/.vite && npm run dev`
2. **타입 에러**: TypeScript 버전 확인 및 타입 정의 업데이트
3. **빌드 실패**: 플랫폼별 종속성 확인

### 디버깅
- 개발자 도구: `Ctrl+Shift+I` (개발 모드)
- 로그 확인: 콘솔 및 터미널 출력
- IPC 통신 디버깅: 메인/렌더러 프로세스 간 통신 추적

이 프로젝트는 현대적인 개발 표준과 베스트 프랙티스를 따르며, 확장 가능하고 유지보수하기 쉬운 구조로 설계되었습니다.