/**
 * Electron API type definitions
 * Ensures type safety for IPC communication
 */

export interface DirectorySelectResult {
  success: boolean;
  path?: string;
  name?: string;
  error?: string;
}

export interface AIToolInitResult {
  success: boolean;
  error?: string;
}

export interface TerminalCommandResult {
  success: boolean;
  error?: string;
}

export interface ElectronAPI {
  // Directory operations
  selectDirectory: () => Promise<DirectorySelectResult>;
  getHomeDirectory: () => Promise<DirectorySelectResult>;
  listDirectory: (dirPath: string) => Promise<{
    success: boolean;
    items?: Array<{
      name: string;
      path: string;
      type: 'directory' | 'file';
      isDirectory: boolean;
      canDelete: boolean;
    }>;
    error?: string;
  }>;
  createDirectory: (parentPath: string, folderName: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  deleteDirectory: (dirPath: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  openFolder: (folderPath: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  
  // AI tool services
  initializeAITool: (workspaceDir: string, aiTool: 'gemini' | 'claude') => Promise<AIToolInitResult>;
  sendMessage: (message: string) => Promise<TerminalCommandResult>;
  sendTerminalCommand: (command: string) => Promise<TerminalCommandResult>;
  sendTerminalInput: (input: string) => Promise<TerminalCommandResult>;
  interruptTerminal: () => Promise<TerminalCommandResult>;
  
  // Tool execution confirmation
  confirmToolExecution: (request: unknown) => Promise<boolean>;
  
  // App configuration
  getAppConfig: () => Promise<{
    version: string;
    platform: string;
    isDev: boolean;
  }>;
  
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

// ElectronAPI interface exported for use in global declarations