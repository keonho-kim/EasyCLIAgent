/**
 * At Command Processor
 * @ 명령어 처리기
 */

import type { AtCommandPart } from '../model/types';

export interface AtCommandResult {
  command: string;
  start: number;
  end: number;
  isPath: boolean;
  basePath?: string;
  searchQuery?: string;
}

export const extractAtCommandAtPosition = (text: string, position: number): AtCommandResult | null => {
  // @ 기호를 찾아서 명령어 추출
  const beforeCursor = text.substring(0, position);
  const atMatch = beforeCursor.match(/@([^\s]*)$/);
  
  if (atMatch) {
    const command = atMatch[0];
    const start = position - command.length;
    const end = position;
    const commandContent = atMatch[1]; // @ 제외한 내용
    
    // 경로인지 확인 (/ 포함 여부)
    const isPath = commandContent.includes('/');
    let basePath = '';
    let searchQuery = commandContent;
    
    if (isPath) {
      // 마지막 / 위치 찾기
      const lastSlashIndex = commandContent.lastIndexOf('/');
      if (lastSlashIndex !== -1) {
        basePath = commandContent.substring(0, lastSlashIndex + 1);
        searchQuery = commandContent.substring(lastSlashIndex + 1);
      }
    }
    
    return {
      command,
      start,
      end,
      isPath,
      basePath,
      searchQuery,
    };
  }
  
  return null;
};

export const parseAtCommands = (text: string): AtCommandPart[] => {
  const parts: AtCommandPart[] = [];
  const regex = /@([^\s]+)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before @command
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
        startIndex: lastIndex,
        endIndex: match.index,
      });
    }

    // Add @command
    parts.push({
      type: 'atPath',
      content: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
      startIndex: lastIndex,
      endIndex: text.length,
    });
  }

  return parts;
};