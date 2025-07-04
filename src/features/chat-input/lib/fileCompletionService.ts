/**
 * File Completion Service
 * 파일 자동완성 서비스
 */

import * as path from 'path-browserify';
import type { CompletionItem } from '../model/types';

export class FileCompletionService {
  private workspaceDir: string;
  private cachedResults: Map<string, { items: CompletionItem[], timestamp: number }> = new Map();
  private cacheTimeout = 5000; // 5초 캐시

  constructor(workspaceDir: string) {
    this.workspaceDir = workspaceDir;
  }

  async getFileCompletions(query: string, basePath: string = ''): Promise<CompletionItem[]> {
    try {
      // @ 제거한 검색어
      const searchQuery = query.replace('@', '').trim();
      
      // 경로 기반 탐색을 위한 디렉토리 경로 결정
      const targetDir = basePath 
        ? path.join(this.workspaceDir, basePath)
        : this.workspaceDir;
      
      // 캐시 키에 basePath 포함
      const cacheKey = `${targetDir}:${searchQuery}`;
      const cached = this.cachedResults.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.items;
      }
      
      // 특정 디렉토리의 내용을 가져오기
      if (window.electronAPI?.listDirectory) {
        const result = await window.electronAPI.listDirectory(targetDir);
        if (result.success && result.items) {
          // searchQuery가 있으면 필터링, 없으면 전체 표시
          let filteredItems = result.items;
          if (searchQuery) {
            filteredItems = result.items.filter(item => 
              item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          
          const completionItems = filteredItems
            .slice(0, 30) // 최대 30개
            .map(item => {
              const relativePath = basePath 
                ? path.join(basePath, item.name)
                : item.name;
              
              return {
                id: item.path,
                label: item.name,
                detail: item.type === 'directory' ? '폴더' : '파일',
                insertText: item.type === 'directory' 
                  ? `@${relativePath}/` // 폴더는 / 추가
                  : `@${relativePath}`,
                kind: item.type === 'directory' ? 'folder' as const : 'file' as const,
                sortText: item.name,
              };
            });
          
          // 결과 캐싱
          this.cachedResults.set(cacheKey, {
            items: completionItems,
            timestamp: Date.now(),
          });
          
          // 오래된 캐시 제거
          if (this.cachedResults.size > 50) {
            const oldestKey = Array.from(this.cachedResults.entries())
              .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
            this.cachedResults.delete(oldestKey);
          }
          
          return completionItems;
        }
      }
      
      return [];
    } catch (error) {
      console.error('File completion error:', error);
      return [];
    }
  }
  
  // 캐시 초기화
  clearCache() {
    this.cachedResults.clear();
  }
}