/**
 * App IPC Handlers
 * 앱 관련 IPC 핸들러들 (SRP 준수)
 */

import { ipcMain } from 'electron';
import { createWindow } from '../windowManager';
import type { AppConfig } from '../types/index';

export function setupAppHandlers() {
  // 새 윈도우 생성
  ipcMain.handle('app:new-window', () => {
    createWindow();
  });

  // 앱 설정 정보 가져오기
  ipcMain.handle('get-app-config', async (): Promise<AppConfig> => {
    return {
      version: process.env.npm_package_version || '1.0.0',
      platform: process.platform,
      isDev: process.env.NODE_ENV === 'development'
    };
  });
}