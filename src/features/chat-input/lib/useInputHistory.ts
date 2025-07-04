/**
 * Input History Management Hook
 * 채팅 입력 히스토리를 관리하는 훅
 */

import { useState, useCallback } from 'react';

export interface InputHistoryManager {
  history: string[];
  historyIndex: number;
  addToHistory: (message: string) => void;
  navigateHistory: (direction: 1 | -1, currentMessage: string) => string;
  resetHistoryIndex: () => void;
}

export const useInputHistory = (): InputHistoryManager => {
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = useCallback((message: string) => {
    if (message.trim()) {
      setHistory(prev => {
        // 중복 제거 및 최대 50개 제한
        const filtered = prev.filter(item => item !== message);
        return [message, ...filtered].slice(0, 50);
      });
      setHistoryIndex(-1);
    }
  }, []);

  const navigateHistory = useCallback((direction: 1 | -1, currentMessage: string): string => {
    const newIndex = Math.max(-1, Math.min(history.length - 1, historyIndex + direction));
    setHistoryIndex(newIndex);
    
    if (newIndex === -1) {
      return currentMessage;
    }
    return history[newIndex];
  }, [history, historyIndex]);

  const resetHistoryIndex = useCallback(() => {
    setHistoryIndex(-1);
  }, []);

  return {
    history,
    historyIndex,
    addToHistory,
    navigateHistory,
    resetHistoryIndex,
  };
};