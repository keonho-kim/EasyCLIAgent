/**
 * Text History Hook
 * Undo/Redo 기능을 위한 히스토리 관리
 * SRP: 텍스트 히스토리 관리만 담당
 */

import { useState, useCallback, useRef } from 'react';

interface UseTextHistoryReturn {
  addToHistory: (text: string) => void;
  undo: () => string | null;
  redo: () => string | null;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

const MAX_HISTORY_SIZE = 50;

export const useTextHistory = (): UseTextHistoryReturn => {
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const lastSavedText = useRef<string>('');

  const addToHistory = useCallback((text: string) => {
    // 동일한 텍스트는 추가하지 않음
    if (text === lastSavedText.current) return;
    
    setHistory(prev => {
      // 현재 위치 이후의 히스토리는 제거
      const newHistory = [...prev.slice(0, currentIndex + 1), text];
      
      // 최대 크기 제한
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
        setCurrentIndex(prev => Math.max(0, prev - 1));
      } else {
        setCurrentIndex(newHistory.length - 1);
      }
      
      return newHistory;
    });
    
    lastSavedText.current = text;
  }, [currentIndex]);

  const undo = useCallback((): string | null => {
    if (currentIndex <= 0) return null;
    
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    return history[newIndex];
  }, [currentIndex, history]);

  const redo = useCallback((): string | null => {
    if (currentIndex >= history.length - 1) return null;
    
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    return history[newIndex];
  }, [currentIndex, history]);

  const clear = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    lastSavedText.current = '';
  }, []);

  return {
    addToHistory,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    clear,
  };
};