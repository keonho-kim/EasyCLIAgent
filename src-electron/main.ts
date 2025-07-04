/**
 * Main Electron Process
 * 메인 프로세스 진입점 (리팩토링된 버전)
 */

import { app, BrowserWindow, globalShortcut } from 'electron';
import { AgentService } from './services/AgentService';
import { createWindow } from './windowManager';
import { setupAllIpcHandlers } from './ipcHandlers';

// 서비스 인스턴스
let agentService: AgentService;

// 앱 초기화
app.whenReady().then(() => {
  createWindow();
  
  // 서비스 초기화
  agentService = new AgentService();
  
  // IPC 핸들러 설정
  setupAllIpcHandlers(agentService);

  // 글로벌 단축키 등록
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.toggleDevTools();
    }
  });
});

// macOS에서 모든 창이 닫혀도 앱이 종료되지 않도록
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS에서 독 아이콘 클릭 시 윈도우 재생성
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 앱 종료 시 정리 작업
app.on('before-quit', async () => {
  try {
    globalShortcut.unregisterAll();
  } catch (error) {
    console.error('Error during app shutdown:', error);
  }
});

// 보안 설정: 외부 URL 로드 방지
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    return { action: 'deny' };
  });

  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:5173' && parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
});