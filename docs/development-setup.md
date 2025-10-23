# 개발 환경 설정

EasyCLIAgent 개발을 위한 환경 설정 가이드입니다.

## 사전 요구사항

### 필수 도구

- **Node.js**: 18.0.0 이상
- **npm**: 8.0.0 이상 또는 **yarn**: 1.22.0 이상
- **Git**: 버전 관리

### 권장 개발 도구

- **VS Code**: 주요 IDE
- **Chrome/Edge**: 디버깅용 브라우저

## 프로젝트 설정

### 1. 저장소 클론 및 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/EasyCLIAgent.git
cd EasyCLIAgent

# 의존성 설치
npm install

# 또는 yarn 사용
yarn install
```

### 2. 환경 변수 설정 (선택사항)

```bash
# .env 파일 생성
cp .env.example .env

# 필요한 설정 수정
vim .env
```

주요 환경 변수:

```env
NODE_ENV=development
VITE_DEV_SERVER_URL=http://localhost:5173
LOG_LEVEL=debug
ENABLE_DEBUG_LOGS=true
```

### 3. 개발 서버 시작

```bash
# 개발 모드 실행
npm run dev

# 또는 개별 실행
npm run dev:renderer  # Vite 개발 서버
npm run dev:main     # Electron 메인 프로세스
```

## IDE 설정

### VS Code 설정

#### 필수 확장

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-json"
  ]
}
```

#### 작업 공간 설정 (.vscode/settings.json)

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

#### 디버그 설정 (.vscode/launch.json)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Electron Main",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "windows": {
        "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron.cmd"
      },
      "args": ["dist-electron/main.js"],
      "outputCapture": "std"
    }
  ]
}
```

### ESLint 설정

프로젝트는 엄격한 ESLint 규칙을 사용합니다:

```typescript
// eslint.config.js 주요 설정
export default [
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'react-hooks/exhaustive-deps': 'error',
      'prefer-const': 'error'
    }
  }
];
```

## 빌드 및 테스트

### 빌드 명령어

```bash
# 타입 체크
npm run typecheck

# 린트 검사
npm run lint
npm run lint:fix

# 프로덕션 빌드
npm run build

# 개발용 빌드 (디렉토리만)
npm run build:dir
```

### 테스트 실행

```bash
# 유닛 테스트
npm run test

# 테스트 UI
npm run test:ui

# 커버리지 포함 테스트
npm run test:coverage

# E2E 테스트 (구현 예정)
npm run test:e2e
```

## 디버깅

### 메인 프로세스 디버깅

1. **VS Code 디버거 사용**:
   - F5 키로 "Electron Main" 구성 실행
   - 브레이크포인트 설정 가능

2. **로그 디버깅**:

   ```typescript
   console.log('[Main]', 'Debug message');
   ```

### 렌더러 프로세스 디버깅

1. **Chrome DevTools**:

   ```bash
   # 개발 모드에서
   Ctrl+Shift+I (Windows/Linux)
   Cmd+Option+I (macOS)
   ```

2. **React DevTools**:
   - Chrome 확장 설치
   - 컴포넌트 트리 및 상태 검사

### IPC 통신 디버깅

```typescript
// 렌더러에서
console.log('[IPC] Sending:', message);
const result = await window.electronAPI.sendMessage(message);
console.log('[IPC] Received:', result);

// 메인에서
ipcMain.handle('send-message', async (_, message) => {
  console.log('[IPC] Handler received:', message);
  // ...
});
```

## 프로젝트 구조 이해

### Feature-Sliced Design

```
src/
├── features/           # 비즈니스 기능
│   ├── chat-input/    # 채팅 입력
│   │   ├── lib/       # 비즈니스 로직
│   │   ├── model/     # 타입 및 데이터
│   │   └── ui/        # UI 컴포넌트
│   └── terminal/      # 터미널 기능
├── shared/            # 공유 리소스
│   ├── hooks/        # 공통 훅
│   ├── types/        # 공통 타입
│   └── utils/        # 유틸리티
└── stores/           # 상태 관리
```

### Electron 구조

```
src-electron/
├── main.ts           # 메인 프로세스 진입점
├── preload.ts        # 보안 브릿지
├── windowManager.ts  # 창 관리
├── ipcHandlers/      # IPC 핸들러들
└── services/         # 비즈니스 서비스
```

## 개발 워크플로우

### 1. 기능 개발

```bash
# 새 브랜치 생성
git checkout -b feature/new-feature

# 개발 및 테스트
npm run dev
npm run test

# 코드 품질 확인
npm run lint
npm run typecheck
```

### 2. 커밋 가이드라인

```bash
# 커밋 메시지 형식
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 기타 작업

# 예시
git commit -m "feat: add auto-completion for file paths"
```

### 3. Pull Request

```bash
# 변경사항 푸시
git push origin feature/new-feature

# GitHub에서 PR 생성
# PR 템플릿에 따라 설명 작성
```

## 환경별 설정

### 개발 환경

```bash
# 핫 리로드 활성화
export NODE_ENV=development

# 디버그 로그 활성화
export DEBUG=easycliagent:*

# DevTools 자동 열기
export OPEN_DEVTOOLS=true
```

### 프로덕션 환경

```bash
# 최적화된 빌드
export NODE_ENV=production

# 에러 리포팅 활성화 (향후)
export ENABLE_ERROR_REPORTING=true
```

## 패키지 관리

### 의존성 추가

```bash
# 런타임 의존성
npm install package-name

# 개발 의존성
npm install -D package-name

# 타입 정의
npm install -D @types/package-name
```

### 보안 감사

```bash
# 보안 취약점 검사
npm audit

# 자동 수정
npm audit fix
```

## 성능 프로파일링

### 번들 분석

```bash
# 번들 크기 분석
npm run analyze

# Vite 빌드 분석
npx vite-bundle-analyzer dist-renderer
```

### 메모리 프로파일링

1. **Chrome DevTools Memory 탭** 사용
2. **Heap Snapshot** 촬영
3. **메모리 누수** 감지

## 트러블슈팅

### 일반적인 문제

1. **포트 충돌**:

   ```bash
   # 포트 확인
   lsof -i :5173
   
   # 프로세스 종료
   kill -9 <PID>
   ```

2. **의존성 충돌**:

   ```bash
   # 캐시 삭제
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript 에러**:

   ```bash
   # 타입 체크
   npx tsc --noEmit
   
   # 캐시 삭제
   rm -rf node_modules/.cache
   ```

### 빌드 문제

```bash
# Electron 빌드 디버깅
DEBUG=electron-builder npm run build

# 로그 상세 출력
npm run build -- --verbose
```

## 도움 받기

1. **문서 확인**: [아키텍처 문서](./architecture.md)
2. **GitHub Issues**: 버그 및 기능 요청
3. **Discord/Slack**: 실시간 질문 (링크 추가 예정)

개발 환경이 준비되면 [아키텍처 문서](./architecture.md)를 읽고 코드 구조를 이해해보세요!
