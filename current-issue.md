# EasyCLIAgent 터미널 기능 관련 기술적 이슈 보고서

## 1. 이슈 개요

안녕하세요. EasyCLIAgent 프로젝트에서 발생한 기술적 이슈에 대해 보고드리고자 합니다.

현재 개발 환경(`npm run dev`)에서는 터미널 기능이 정상적으로 작동하지만, 프로덕션 빌드(`npm run build`) 후 배포된 앱에서는 터미널 기능이 전혀 작동하지 않는 상황입니다.

## 2. 기술적 세부사항

### 2.1 환경 정보
- **플랫폼**: macOS (Darwin 24.5.0)
- **Node.js**: v18+
- **Electron**: v33.2.1
- **핵심 의존성**: node-pty v1.0.0 (네이티브 모듈)

### 2.2 문제 현상
1. 개발 환경에서는 터미널 생성 및 PTY 통신이 정상적으로 동작
2. 프로덕션 빌드 후에는 터미널 관련 로그가 전혀 출력되지 않음
3. 네이티브 모듈 `node-pty`의 import 단계에서 실패하는 것으로 추정

## 3. 현재 설정 상태

### 3.1 Electron Builder 설정
```javascript
// electron-builder.config.js
{
  nodeGypRebuild: true,
  asarUnpack: ['node_modules/node-pty/**/*'],
  files: [
    'dist-renderer/**/*',
    'dist-electron/**/*',
    'node_modules/**/*',
    'package.json',
  ]
}
```

### 3.2 Vite 설정
```javascript
// vite.config.ts
rollupOptions: {
  external: [
    'node-pty',
    // ... 기타 Node.js 내장 모듈들
  ],
}
```

### 3.3 네이티브 모듈 빌드 상태
- 빌드 과정에서 `@electron/rebuild` 성공적으로 실행
- 바이너리 파일 위치: `dist/mac-arm64/EasyCLIAgent.app/Contents/Resources/app.asar.unpacked/node_modules/node-pty/build/Release/pty.node`

## 4. 문제 분석

### 4.1 추정 원인
1. **모듈 해결 경로 문제**: ASAR 압축 해제된 모듈에 대한 Node.js 모듈 해결 메커니즘 이슈
2. **런타임 환경 차이**: 개발 환경과 프로덕션 환경의 모듈 로딩 컨텍스트 차이
3. **Electron 메인 프로세스 제약**: 네이티브 모듈에 대한 런타임 접근 권한 문제

### 4.2 확인된 사실들
- 네이티브 모듈 바이너리는 올바른 위치에 존재
- Electron Builder의 네이티브 모듈 재빌드 과정은 정상 완료
- 문제는 런타임에서 모듈 로딩 시점에 발생

## 5. 시도한 해결 방법들

### 5.1 설정 수정
- `nodeGypRebuild: false` → `true`로 변경
- `asarUnpack` 배열에 `node-pty` 모듈 추가
- 디버깅 로그 추가하여 모듈 로딩 상태 확인

### 5.2 결과
- 빌드 과정은 모두 성공적으로 완료
- 하지만 런타임에서 여전히 모듈 로딩 실패

## 6. 추가 조사가 필요한 사항들

### 6.1 기술적 검토 포인트
1. **Electron 버전 호환성**: 현재 Electron v33과 node-pty v1.0.0의 호환성 확인
2. **모듈 로딩 방식**: Dynamic import 또는 조건부 require를 통한 지연 로딩 검토
3. **대안 아키텍처**: 터미널 기능을 별도 프로세스로 분리하는 방안 검토

### 6.2 디버깅 계획
1. 메인 프로세스 시작 시점에서 모듈 로딩 상태 상세 확인
2. 네이티브 모듈 경로 해결 과정 추적
3. macOS 특정 권한 또는 보안 정책 확인

## 7. 요청사항

이 문제에 대해 시니어 개발자님의 경험과 조언을 구하고 싶습니다. 특히:

1. Electron 앱에서 네이티브 모듈 배포 시 놓치기 쉬운 설정이나 주의사항
2. 비슷한 이슈를 경험하신 적이 있으시다면 해결 방법
3. 현재 접근 방식에 대한 개선 제안

감사합니다.

---
**작성일**: 2024-07-04  
**우선순위**: Critical (핵심 기능 미작동)  
**관련 파일**: 
- `src-electron/services/TerminalManager.ts`
- `electron-builder.config.js`
- `vite.config.ts`