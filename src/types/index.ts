// Base interfaces
export interface DirectoryInfo {
  path: string;
  name: string;
}

export interface RecentFolder {
  id: string;
  path: string;
  name: string;
  description?: string;
  isBookmarked: boolean;
  lastAccessed: Date;
  accessCount: number;
  aiTool?: 'gemini' | 'claude'; // 마지막으로 사용한 AI 툴
}

// UI State
export interface UIState {
  sidebarOpen: boolean;
  terminalSize: {
    width: number;
    height: number;
  };
  theme: 'dark' | 'light';
  fontSize: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// Tab State
export interface TabState {
  id: string;
  title: string;
  workspace: DirectoryInfo | null;
  aiTool: 'gemini' | 'claude' | null;
  // Potentially add more tab-specific state here later, like history
}

// App State
export interface AppStore {
  appConfig: AppConfig | null;
  tabs: TabState[];
  activeTabId: string | null;
  uiState: UIState;
  recentFolders: RecentFolder[];

  // Actions
  setAppConfig: (config: AppConfig) => void;
  updateUIState: (updates: Partial<UIState>) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setFontSize: (fontSize: number) => void;
  setLogLevel: (logLevel: UIState['logLevel']) => void;

  // Tab Actions
  addTab: (andSelect?: boolean) => string;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<Omit<TabState, 'id'>>) => void;
  goBack: (tabId: string) => void;

  // Recent folders
  addRecentFolder: (directory: DirectoryInfo, description?: string, aiTool?: 'gemini' | 'claude') => void;
  updateRecentFolder: (id: string, updates: Partial<RecentFolder>) => void;
  removeRecentFolder: (id: string) => void;
  toggleBookmark: (id: string) => void;
  clearRecentFolders: () => void;
}

// Gemini Events
export interface GeminiEvent {
  type: 'content' | 'error' | 'tool-call-request' | 'tool-call-response';
  timestamp: Date;
  data: {
    content?: string;
    message?: string;
    source?: string;
    stack?: string;
    code?: number;
    signal?: string;
    [key: string]: any;
  };
}

// File System Events
export interface FileSystemEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
  path: string;
  timestamp: Date;
}

// App Configuration
export interface AppConfig {
  version: string;
  platform: string; // Added platform
  isDev: boolean; // Added isDev
  geminiModel?: string;
  telemetry?: boolean;
}

// Directory Operations
export interface DirectorySelectResult {
  success: boolean;
  path?: string;
  name?: string;
  error?: string;
}

export interface DirectoryOperationResult {
  success: boolean;
  error?: string;
}

export interface DirectoryListResult {
  success: boolean;
  items?: Array<{
    name: string;
    path: string;
    type: 'directory' | 'file';
    isDirectory: boolean;
    canDelete: boolean;
  }>;
  error?: string;
}

// Tool Confirmation
export interface ToolConfirmationRequest {
  id: string;
  displayName: string;
  description: string;
  parameters: Record<string, any>;
}

// ElectronAPI 타입 (window.electronAPI)
export interface ElectronAPI {
  // Directory operations
  selectDirectory: () => Promise<DirectorySelectResult>;
  getHomeDirectory: () => Promise<DirectorySelectResult>;
  listDirectory: (dirPath: string) => Promise<DirectoryListResult>;
  createDirectory: (parentPath: string, folderName: string) => Promise<DirectoryOperationResult>;
  deleteDirectory: (dirPath: string) => Promise<DirectoryOperationResult>;
  
  // AI tool services
  initializeAITool: (workspaceDir: string, aiTool: 'gemini' | 'claude') => Promise<{ success: boolean; error?: string }>;
  sendMessage: (message: string) => Promise<{ success: boolean; error?: string }>;
  sendTerminalCommand: (command: string) => Promise<{ success: boolean; error?: string }>;
  sendTerminalInput: (input: string) => Promise<{ success: boolean; error?: string }>;
  interruptTerminal: () => Promise<{ success: boolean; error?: string }>;
  
  // Tool execution confirmation
  confirmToolExecution: (request: unknown) => Promise<boolean>;
  
  // App configuration
  getAppConfig: () => Promise<AppConfig>;
  
  // File system watching
  startFileWatching: (directoryPath: string) => Promise<void>;
  stopFileWatching: () => Promise<void>;
  
  // AI configuration file creation
  createAIConfigFile: (directoryPath: string, aiTool: 'gemini' | 'claude') => Promise<{
    success: boolean;
    error?: string;
    filePath?: string;
  }>;
  
  // File system operations
  readFileOrCreate: (filePath: string) => Promise<{
    success: boolean;
    content?: string;
    error?: string;
  }>;
  writeFile: (filePath: string, content: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  searchFilesRecursive: (dirPath: string, query: string) => Promise<{
    success: boolean;
    items?: Array<{
      name: string;
      path: string;
      relativePath: string;
      type: 'directory' | 'file';
      isDirectory: boolean;
    }>;
    error?: string;
  }>;
  
  // Event listeners
  onTerminalData: (callback: (data: string) => void) => () => void;
  onFileSystemEvent: (callback: (event: unknown) => void) => () => void;
  
  // Utilities
  removeAllListeners: (channel: string) => void;
  newWindow: () => Promise<void>;
}

// Window interface extension
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Component Props
export interface DirectorySelectorProps {
  onDirectorySelect: (tabId: string, path: string, name: string) => void;
}


// Gemini Store Types
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'system' | 'gemini' | 'tool' | 'file' | 'user';
  message: string;
  metadata?: Record<string, any>;
}

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

export interface SessionInfo {
  id: string;
  workspaceDir: string;
  workspaceName: string;
  startTime: Date;
  messageCount: number;
  toolCallCount: number;
}

export interface GeminiStore {
  isInitialized: boolean;
  connectionStatus: ConnectionStatus;
  currentSession: SessionInfo | null;
  messages: ChatMessage[];
  logs: LogEntry[];
  toolCalls: ToolCall[];
  isStreaming: boolean;

  initialize: (workspaceDir: string, workspaceName: string) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  addMessage: (message: ChatMessage) => void;
  addLogEntry: (log: LogEntry) => void;
  addToolCall: (toolCall: ToolCall) => void;
  updateToolCall: (id: string, updates: Partial<ToolCall>) => void;
  setStreaming: (streaming: boolean) => void;
  clearMessages: () => void;
  clearLogs: () => void;
  reset: () => void;
}
