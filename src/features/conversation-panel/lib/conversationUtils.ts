/**
 * Conversation Utility Functions
 * 대화 관련 유틸리티 함수들
 */

import type { AIToolInfo } from '../model/types';

// Format timestamp for display
export const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// Get AI tool icon and color
export const getAIToolInfo = (aiTool: 'gemini' | 'claude'): AIToolInfo => {
  return aiTool === 'gemini' 
    ? { icon: '💎', color: 'primary.main', label: 'Gemini' }
    : { icon: '🤖', color: 'secondary.main', label: 'Claude' };
};

// Calculate item height for virtualization
export const getItemHeight = (entryId: string, expandedEntries: Set<string>): number => {
  return expandedEntries.has(entryId) ? 180 : 60;
};