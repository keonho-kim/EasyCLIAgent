/**
 * Slash Commands
 * 슬래시 명령어 정의
 */

import type { SlashCommand } from '../model/types';

const geminiCommands: SlashCommand[] = [
  { command: '/help', description: '사용 가능한 명령어 목록' },
  { command: '/clear', description: '대화 내역 삭제' },
  { command: '/reset', description: '세션 초기화' },
  { command: '/files', description: '프로젝트 파일 목록' },
  { command: '/docs', description: '문서 생성' },
  { command: '/test', description: '테스트 실행' },
  { command: '/build', description: '프로젝트 빌드' },
];

const claudeCommands: SlashCommand[] = [
  { command: '/help', description: '사용 가능한 명령어 목록' },
  { command: '/clear', description: '대화 내역 삭제' },
  { command: '/reset', description: '세션 초기화' },
  { command: '/analyze', description: '코드 분석' },
  { command: '/refactor', description: '코드 리팩토링' },
  { command: '/optimize', description: '성능 최적화' },
  { command: '/security', description: '보안 검사' },
];

export const findSlashCommands = (query: string, aiTool: 'gemini' | 'claude' = 'gemini'): SlashCommand[] => {
  const commands = aiTool === 'gemini' ? geminiCommands : claudeCommands;
  const searchTerm = query.toLowerCase().replace('/', '');
  
  if (!searchTerm) {
    return commands;
  }
  
  return commands.filter(cmd => 
    cmd.command.toLowerCase().includes(searchTerm) ||
    cmd.description.toLowerCase().includes(searchTerm)
  );
};