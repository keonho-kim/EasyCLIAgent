// Gemini 이벤트 타입 정의
export interface GeminiEvent {
  type: 'content' | 'tool-call-request' | 'tool-call-response' | 'thought' | 'error' | 'user-cancelled' | 'chat-compressed' | 'output';
  timestamp: Date;
  data: any;
  id?: string;
}

// 디렉토리 선택 결과
export interface DirectorySelectResult {
  success: boolean;
  path?: string;
  name?: string;
  error?: string;
}

// 앱 설정
export interface AppConfig {
  version: string;
  platform: string;
  isDev: boolean;
}

// 도구 확인 요청
export interface ToolConfirmationRequest {
  toolName: string;
  displayName: string;
  description: string;
  params: Record<string, any>;
  id: string;
}

// 파일 시스템 이벤트
export interface FileSystemEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
  path: string;
  timestamp: Date;
}

// Electron API 인터페이스
export interface ElectronAPI {
  // 디렉토리 선택
  selectDirectory(): Promise<DirectorySelectResult>;
  
  // Gemini 서비스
  initializeGemini(workspaceDir: string): Promise<boolean>;
  sendMessage(message: string): Promise<void>;
  
  // 도구 실행
  confirmToolExecution(request: ToolConfirmationRequest): Promise<boolean>;
  
  // 앱 설정
  getAppConfig(): Promise<AppConfig>;
  
  // 파일 시스템 감시
  startFileWatching(directoryPath: string): Promise<void>;
  stopFileWatching(): Promise<void>;
  
  // 이벤트 리스너
  onGeminiEvent(callback: (event: GeminiEvent) => void): () => void;
  onFileSystemEvent(callback: (event: FileSystemEvent) => void): () => void;
  
  // 유틸리티
  removeAllListeners(channel: string): void;
}

// 메시지 타입
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// 도구 호출 정보
export interface ToolCall {
  id: string;
  name: string;
  displayName: string;
  description: string;
  params: Record<string, any>;
  result?: any;
  status: 'pending' | 'confirmed' | 'executed' | 'failed' | 'cancelled';
  timestamp: Date;
}

// 세션 정보
export interface SessionInfo {
  id: string;
  workspaceDir: string;
  workspaceName: string;
  startTime: Date;
  messageCount: number;
  toolCallCount: number;
}

// 로그 엔트리
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'system' | 'gemini' | 'tool' | 'file' | 'user';
  message: string;
  metadata?: Record<string, any>;
}