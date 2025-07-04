/**
 * File System IPC Handlers
 * 파일 시스템 관련 IPC 핸들러들 (SRP 준수)
 */

import { ipcMain } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
export function setupFileSystemHandlers() {
  // 파일 시스템 감시 시작
  ipcMain.handle('start-file-watching', async (event, directoryPath: string): Promise<void> => {
    try {
      // TODO: 파일 시스템 감시 구현
      console.log('File watching started for:', directoryPath);
    } catch (error) {
      console.error('File watching start error:', error);
      throw error;
    }
  });

  // 파일 시스템 감시 중지
  ipcMain.handle('stop-file-watching', async (): Promise<void> => {
    try {
      // TODO: 파일 시스템 감시 중지 구현
      console.log('File watching stopped');
    } catch (error) {
      console.error('File watching stop error:', error);
      throw error;
    }
  });

  // AI 설정 파일 생성
  ipcMain.handle('create-ai-config-file', async (_, directoryPath: string, aiTool: 'gemini' | 'claude'): Promise<{
    success: boolean;
    error?: string;
    filePath?: string;
  }> => {
    try {
      let configFileName: string;
      let configContent: string;

      if (aiTool === 'gemini') {
        configFileName = '.geminirc';
        configContent = `# Gemini CLI 설정 파일
# 이 파일은 gemini-cli의 설정을 관리합니다.

# 기본 설정
model: gemini-pro
temperature: 0.7
max_tokens: 4096

# 프로젝트별 컨텍스트
include_files:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.py"
  - "**/*.md"

exclude_files:
  - "node_modules/**"
  - "dist/**"
  - ".git/**"
  - "**/*.log"

# 추가 설정
auto_save: true
show_diff: true
`;
      } else {
        configFileName = 'CLAUDE.md';
        configContent = `# Claude Code Configuration

This file contains configuration and instructions for Claude Code in this project.

## Project Context

[프로젝트에 대한 설명을 여기에 작성하세요]

## Coding Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write comprehensive tests
- Document complex functions

## Additional Instructions

[Claude Code에 대한 추가 지침을 여기에 작성하세요]
`;
      }

      const filePath = path.join(directoryPath, configFileName);
      
      // 파일이 이미 존재하는지 확인
      try {
        await fs.access(filePath);
        return {
          success: false,
          error: `${configFileName} 파일이 이미 존재합니다.`
        };
      } catch {
        // 파일이 존재하지 않으므로 생성 진행
      }
      
      await fs.writeFile(filePath, configContent, 'utf8');
      
      return {
        success: true,
        filePath
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AI 설정 파일 생성 실패'
      };
    }
  });

  // 파일 읽기 또는 생성
  ipcMain.handle('fs:readFileOrCreate', async (_, filePath: string): Promise<{
    success: boolean;
    content?: string;
    error?: string;
  }> => {
    try {
      // 먼저 파일을 읽어보기
      try {
        const content = await fs.readFile(filePath, 'utf8');
        return {
          success: true,
          content
        };
      } catch (readError) {
        // 파일이 없으면 빈 파일 생성
        await fs.writeFile(filePath, '', 'utf8');
        return {
          success: true,
          content: ''
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '파일 읽기/생성 실패'
      };
    }
  });

  // 파일 쓰기
  ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      await fs.writeFile(filePath, content, 'utf8');
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '파일 쓰기 실패'
      };
    }
  });

  // 파일 재귀 검색
  ipcMain.handle('search-files-recursive', async (_, dirPath: string, query: string): Promise<{
    success: boolean;
    items?: Array<{
      name: string;
      path: string;
      relativePath: string;
      type: 'directory' | 'file';
      isDirectory: boolean;
    }>;
    error?: string;
  }> => {
    try {
      const results: Array<{
        name: string;
        path: string;
        relativePath: string;
        type: 'directory' | 'file';
        isDirectory: boolean;
      }> = [];

      async function searchRecursive(currentPath: string) {
        try {
          const items = await fs.readdir(currentPath, { withFileTypes: true });
          
          for (const item of items) {
            // 숨김 파일 및 제외할 디렉토리 건너뛰기
            if (item.name.startsWith('.') || 
                item.name === 'node_modules' || 
                item.name === 'dist') {
              continue;
            }
            
            const itemPath = path.join(currentPath, item.name);
            const relativePath = path.relative(dirPath, itemPath);
            
            // 검색어와 매치되는지 확인
            if (item.name.toLowerCase().includes(query.toLowerCase())) {
              results.push({
                name: item.name,
                path: itemPath,
                relativePath,
                type: item.isDirectory() ? 'directory' : 'file',
                isDirectory: item.isDirectory()
              });
            }
            
            // 디렉토리인 경우 재귀적으로 검색
            if (item.isDirectory()) {
              await searchRecursive(itemPath);
            }
          }
        } catch (error) {
          // 권한 없는 디렉토리 등은 무시
          console.warn(`Cannot access directory: ${currentPath}`);
        }
      }

      await searchRecursive(dirPath);
      
      // 결과 정렬 (디렉토리 우선, 이름순)
      results.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      
      return {
        success: true,
        items: results
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '파일 검색 실패'
      };
    }
  });
}