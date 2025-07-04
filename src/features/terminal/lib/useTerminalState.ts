/**
 * Terminal State Management Hook
 * 터미널 상태 관리 훅
 */

import { useState, useCallback } from 'react';
import type { TerminalState } from '../model/types';

export interface TerminalStateManager {
  state: TerminalState;
  setTerminal: (terminal: TerminalState['terminal']) => void;
  setFitAddon: (fitAddon: TerminalState['fitAddon']) => void;
  toggleFullscreen: () => void;
  setScrolling: (scrolling: boolean) => void;
}

export const useTerminalState = (): TerminalStateManager => {
  const [state, setState] = useState<TerminalState>({
    terminal: null,
    fitAddon: null,
    isFullscreen: false,
    isScrolling: false,
  });

  const setTerminal = useCallback((terminal: TerminalState['terminal']) => {
    setState(prev => ({ ...prev, terminal }));
  }, []);

  const setFitAddon = useCallback((fitAddon: TerminalState['fitAddon']) => {
    setState(prev => ({ ...prev, fitAddon }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  const setScrolling = useCallback((isScrolling: boolean) => {
    setState(prev => ({ ...prev, isScrolling }));
  }, []);

  return {
    state,
    setTerminal,
    setFitAddon,
    toggleFullscreen,
    setScrolling,
  };
};