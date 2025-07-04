/**
 * Directory IPC Handlers
 * 디렉토리 관련 IPC 핸들러들 (SRP 준수)
 */

import { ipcMain, dialog, shell } from 'electron';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { DirectorySelectResult } from '../types/index';

export function setupDirectoryHandlers() {
  // 홈 디렉토리 가져오기
  ipcMain.handle('get-home-directory', async (): Promise<DirectorySelectResult> => {
    try {
      const homeDir = os.homedir();
      const stats = await fs.stat(homeDir);
      
      if (stats.isDirectory()) {
        return {
          success: true,
          path: homeDir,
          name: path.basename(homeDir)
        };
      } else {
        return {
          success: false,
          error: '홈 디렉토리를 찾을 수 없습니다.'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '홈 디렉토리 접근 실패'
      };
    }
  });

  // 디렉토리 목록 가져오기
  ipcMain.handle('list-directory', async (_, dirPath: string): Promise<{
    success: boolean;
    items?: Array<{
      name: string;
      path: string;
      type: 'directory' | 'file';
      isDirectory: boolean;
      canDelete: boolean;
    }>;
    error?: string;
  }> => {
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      const result = [];
      
      for (const item of items) {
        // 숨김 파일 제외 (선택적)
        if (item.name.startsWith('.')) {
          continue;
        }
        
        const itemPath = path.join(dirPath, item.name);
        const isDirectory = item.isDirectory();
        
        // 삭제 가능 여부 확인 (루트 디렉토리 등은 삭제 불가)
        const canDelete = !['/', os.homedir(), '/Users', '/System', '/Applications'].includes(itemPath);
        
        result.push({
          name: item.name,
          path: itemPath,
          type: isDirectory ? 'directory' as const : 'file' as const,
          isDirectory,
          canDelete
        });
      }
      
      // 디렉토리 우선 정렬
      result.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      
      return {
        success: true,
        items: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '디렉토리 목록 조회 실패'
      };
    }
  });

  // 디렉토리 생성
  ipcMain.handle('create-directory', async (_, parentPath: string, folderName: string): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      // 폴더명 유효성 검사
      if (!folderName || folderName.trim() === '') {
        return {
          success: false,
          error: '폴더명을 입력해주세요.'
        };
      }
      
      // 금지된 문자 확인
      const invalidChars = /[<>:"/\\|?*]/;
      if (invalidChars.test(folderName)) {
        return {
          success: false,
          error: '폴더명에 사용할 수 없는 문자가 포함되어 있습니다.'
        };
      }
      
      const newDirPath = path.join(parentPath, folderName);
      
      // 이미 존재하는지 확인
      try {
        await fs.access(newDirPath);
        return {
          success: false,
          error: '같은 이름의 폴더가 이미 존재합니다.'
        };
      } catch {
        // 존재하지 않으므로 생성 진행
      }
      
      await fs.mkdir(newDirPath, { recursive: true });
      
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '폴더 생성 실패'
      };
    }
  });

  // 디렉토리 삭제
  ipcMain.handle('delete-directory', async (_, dirPath: string): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      // 중요한 시스템 디렉토리 보호
      const protectedPaths = ['/', os.homedir(), '/Users', '/System', '/Applications'];
      if (protectedPaths.some(protectedPath => dirPath.startsWith(protectedPath + '/') || dirPath === protectedPath)) {
        return {
          success: false,
          error: '시스템 디렉토리는 삭제할 수 없습니다.'
        };
      }
      
      // 디렉토리 존재 확인
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        return {
          success: false,
          error: '디렉토리가 아닙니다.'
        };
      }
      
      await fs.rmdir(dirPath, { recursive: true });
      
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '디렉토리 삭제 실패'
      };
    }
  });

  // 디렉토리 선택 다이얼로그
  ipcMain.handle('select-directory', async (event): Promise<DirectorySelectResult> => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: '작업 디렉토리 선택',
      });

      if (result.canceled || result.filePaths.length === 0) {
        return {
          success: false,
          error: '선택이 취소되었습니다.'
        };
      }

      const selectedPath = result.filePaths[0];
      const dirName = path.basename(selectedPath);

      return {
        success: true,
        path: selectedPath,
        name: dirName
      };
    } catch (error) {
      console.error('Directory selection error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '디렉토리 선택 실패'
      };
    }
  });

  // 폴더를 시스템 파일 매니저에서 열기
  ipcMain.handle('open-folder', async (_, folderPath: string): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      // 폴더 경로 존재 확인
      const stats = await fs.stat(folderPath);
      if (!stats.isDirectory()) {
        return {
          success: false,
          error: '지정된 경로가 디렉토리가 아닙니다.'
        };
      }

      // 시스템 파일 매니저에서 폴더 열기
      const result = await shell.openPath(folderPath);
      
      // shell.openPath는 성공시 빈 문자열을 반환하고, 실패시 에러 메시지를 반환
      if (result === '') {
        return {
          success: true
        };
      } else {
        return {
          success: false,
          error: result
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '폴더 열기 실패'
      };
    }
  });
}