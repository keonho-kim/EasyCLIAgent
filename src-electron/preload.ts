const { contextBridge, ipcRenderer } = require('electron');

const electronAPI = {
  // 디렉토리 선택
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  
  // 향상된 디렉토리 브라우저
  getHomeDirectory: () => ipcRenderer.invoke('get-home-directory'),
  listDirectory: (dirPath: string) => ipcRenderer.invoke('list-directory', dirPath),
  createDirectory: (parentPath: string, folderName: string) => 
    ipcRenderer.invoke('create-directory', parentPath, folderName),
  deleteDirectory: (dirPath: string) => ipcRenderer.invoke('delete-directory', dirPath),
  openFolder: (folderPath: string) => ipcRenderer.invoke('open-folder', folderPath),
  
  // AI 도구 서비스 관련
  initializeAITool: (workspaceDir: string, aiTool: 'gemini' | 'claude') => ipcRenderer.invoke('initialize-ai-tool', workspaceDir, aiTool),
  sendMessage: (message: string) => ipcRenderer.invoke('send-message', message),
  sendTerminalCommand: (command: string) => ipcRenderer.invoke('send-terminal-command', command),
  sendTerminalInput: (input: string) => ipcRenderer.invoke('send-terminal-command', input),
  interruptTerminal: () => ipcRenderer.invoke('interrupt-terminal'),
  
  // 도구 실행 확인
  confirmToolExecution: (request: unknown) => 
    ipcRenderer.invoke('confirm-tool-execution', request),
  
  // 앱 설정
  getAppConfig: () => ipcRenderer.invoke('get-app-config'),
  
  // 파일 시스템 감시
  startFileWatching: (directoryPath: string) => 
    ipcRenderer.invoke('start-file-watching', directoryPath),
  stopFileWatching: () => ipcRenderer.invoke('stop-file-watching'),
  
  // AI 설정 파일 생성
  createAIConfigFile: (directoryPath: string, aiTool: 'gemini' | 'claude') => 
    ipcRenderer.invoke('create-ai-config-file', directoryPath, aiTool),
  
  // 파일 시스템 작업
  readFileOrCreate: (filePath: string) => 
    ipcRenderer.invoke('fs:readFileOrCreate', filePath),
  writeFile: (filePath: string, content: string) => 
    ipcRenderer.invoke('fs:writeFile', filePath, content),
  searchFilesRecursive: (dirPath: string, query: string) => 
    ipcRenderer.invoke('search-files-recursive', dirPath, query),
  
  // 이벤트 리스너
  onTerminalData: (callback: (data: string) => void) => {
    const listener = (_: unknown, data: string) => callback(data);
    ipcRenderer.on('terminal:data', listener);
    return () => ipcRenderer.removeListener('terminal:data', listener);
  },
  
  onFileSystemEvent: (callback: (event: unknown) => void) => {
    const listener = (_: unknown, event: unknown) => callback(event);
    ipcRenderer.on('file-system-event', listener);
    return () => ipcRenderer.removeListener('file-system-event', listener);
  },
  
  // 유틸리티
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
  newWindow: () => ipcRenderer.invoke('app:new-window'),
};

// 컨텍스트 브리지로 API 노출
contextBridge.exposeInMainWorld('electronAPI', electronAPI);