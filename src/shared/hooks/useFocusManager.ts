/**
 * Focus Management Hook
 * Follows SRP - Single responsibility for managing UI focus states
 */

import { useState, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';

export type FocusArea = 'terminal' | 'chat' | null;

export interface FocusManager {
  focusedArea: FocusArea;
  setTerminalFocus: () => void;
  setChatFocus: () => void;
  clearFocus: () => void;
  getTerminalStyles: () => TerminalStyles;
  getChatStyles: () => ChatStyles;
}

interface TerminalStyles {
  transition: string;
  opacity: number;
  border: string;
  borderRadius: string;
}

interface ChatStyles {
  transition: string;
  opacity: number;
  border: string;
  borderRadius: string;
}

/**
 * Custom hook for managing focus between terminal and chat areas
 * Provides focus state and styling calculations
 */
export const useFocusManager = (initialFocus: FocusArea = 'terminal'): FocusManager => {
  const [focusedArea, setFocusedArea] = useState<FocusArea>(initialFocus);
  const theme = useTheme();

  const setTerminalFocus = useCallback(() => {
    setFocusedArea('terminal');
  }, []);

  const setChatFocus = useCallback(() => {
    setFocusedArea('chat');
  }, []);

  const clearFocus = useCallback(() => {
    setFocusedArea(null);
  }, []);

  const getTerminalStyles = useCallback((): TerminalStyles => ({
    transition: 'none',
    opacity: focusedArea === 'chat' ? 0.5 : 1,
    border: focusedArea === 'terminal' 
      ? `2px solid ${theme.palette.primary.main}` 
      : '2px solid transparent',
    borderRadius: '4px',
  }), [focusedArea, theme.palette.primary.main]);

  const getChatStyles = useCallback((): ChatStyles => ({
    transition: 'none',
    opacity: focusedArea === 'terminal' ? 0.5 : 1,
    border: focusedArea === 'chat' 
      ? `2px solid ${theme.palette.primary.main}` 
      : '2px solid transparent',
    borderRadius: '8px',
  }), [focusedArea, theme.palette.primary.main]);

  return {
    focusedArea,
    setTerminalFocus,
    setChatFocus,
    clearFocus,
    getTerminalStyles,
    getChatStyles,
  };
};