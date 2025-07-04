/**
 * Window Manager
 * 윈도우 생성 및 관리 로직 (SRP 준수)
 */

import { BrowserWindow, shell } from 'electron';
import path from 'node:path';

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
const windows = new Set<BrowserWindow>();

export function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    title: 'EasyCLIAgent',
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      webSecurity: true,
    },
    titleBarStyle: 'default',
  });

  windows.add(mainWindow);

  mainWindow.on('closed', () => {
    windows.delete(mainWindow);
  });

  // CSP 설정
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const isDev = !!VITE_DEV_SERVER_URL;
    
    // 개발 모드와 프로덕션 모드에 따른 CSP 정책
    const cspPolicy = isDev 
      ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' ws: wss: http: https:; object-src 'none';"
      : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https:; object-src 'none';";
    
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [cspPolicy]
      }
    });
  });

  // 개발 모드에서는 dev server 로드, 프로덕션에서는 빌드된 파일 로드
  if (VITE_DEV_SERVER_URL) {
    console.log('Loading dev server:', VITE_DEV_SERVER_URL);
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    // 개발 모드에서 페이지 로드 확인 (DevTools는 수동으로 열기)
    mainWindow.webContents.once('did-finish-load', () => {
      console.log('Page loaded successfully');
    });
    
    // 에러 로깅
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load page:', errorCode, errorDescription);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist-renderer/index.html'));
  }

  // 외부 링크는 기본 브라우저에서 열기
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  return mainWindow;
}

export function getAllWindows(): Set<BrowserWindow> {
  return windows;
}