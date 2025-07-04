/**
 * Terminal Engine Component
 * xterm.js 터미널 엔진 관리 (SRP: 터미널 초기화와 이벤트 처리만 담당)
 */

import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import '../../../styles/scrollbar.css';
import { useTheme } from '@mui/material/styles';
import { createTerminalConfig } from '../lib/terminalConfig';
import type { TerminalEngineProps, TerminalState } from '../model/types';

interface TerminalEngineComponentProps extends TerminalEngineProps {
  onTerminalReady: (terminal: Terminal, fitAddon: FitAddon) => void;
}

export const TerminalEngine: React.FC<TerminalEngineComponentProps> = ({
  workspaceDir,
  aiTool,
  theme,
  fontSize,
  onFocus,
  isScrolling,
  onScrollingChange,
  onTerminalReady,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const onTerminalReadyRef = useRef(onTerminalReady);
  const onFocusRef = useRef(onFocus);
  const muiTheme = useTheme();

  // Update refs when props change
  useEffect(() => {
    onTerminalReadyRef.current = onTerminalReady;
    onFocusRef.current = onFocus;
  }, [onTerminalReady, onFocus]);

  // Modern scrollbar classes using custom CSS
  const scrollbarClasses = [
    'terminal-scrollbar',
    muiTheme.palette.mode === 'dark' ? 'dark' : '',
    isScrolling ? 'scrolling' : ''
  ].filter(Boolean).join(' ');

  // Handle scroll events to show scrollbar temporarily
  useEffect(() => {
    if (!terminalRef.current) return;

    const handleScroll = () => {
      onScrollingChange(true);
      setTimeout(() => {
        onScrollingChange(false);
      }, 1000);
    };

    const terminalElement = terminalRef.current;
    terminalElement.addEventListener('scroll', handleScroll);

    return () => {
      terminalElement.removeEventListener('scroll', handleScroll);
    };
  }, [onScrollingChange]);

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize the correct agent in the backend
    window.electronAPI.initializeAITool(workspaceDir, aiTool);

    const config = createTerminalConfig(theme, fontSize);
    const term = new Terminal(config);

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(terminalRef.current);
    
    // Fit terminal after DOM is ready
    setTimeout(() => {
      try {
        fit.fit();
      } catch (error) {
        console.warn('Terminal fit error:', error);
      }
    }, 100);

    // Initializing message
    term.writeln('\x1b[33mInitializing...\x1b[0m');
    term.writeln('');

    // Handle window resize
    const handleResize = () => {
      if (fit) {
        try {
          fit.fit();
        } catch (error) {
          console.warn('Terminal resize error:', error);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    // 터미널 데이터 리스너 설정
    const removeDataListener = window.electronAPI.onTerminalData((data: string) => {
      term.write(data);
    });

    // Set up terminal input handling
    term.onKey(({ key, domEvent }) => {
      // Call onFocus when user interacts with terminal
      if (onFocusRef.current) {
        onFocusRef.current();
      }
      
      if (window.electronAPI?.sendTerminalCommand) {
        // Send keystrokes directly to terminal process
        window.electronAPI.sendTerminalCommand(key);
      }
    });

    // Handle terminal focus - use DOM event since xterm doesn't have onFocus
    const terminalElement = terminalRef.current;
    const handleFocus = onFocusRef.current ? () => onFocusRef.current?.() : null;
    
    if (terminalElement && handleFocus) {
      terminalElement.addEventListener('focus', handleFocus, { capture: true });
      terminalElement.addEventListener('click', handleFocus);
    }

    // Notify parent component
    if (onTerminalReadyRef.current) {
      onTerminalReadyRef.current(term, fit);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      removeDataListener();
      if (terminalElement && handleFocus) {
        terminalElement.removeEventListener('focus', handleFocus, { capture: true });
        terminalElement.removeEventListener('click', handleFocus);
      }
      term.dispose();
    };
  }, [workspaceDir, fontSize, theme, aiTool]);

  return (
    <Box
      ref={terminalRef}
      className={`terminal-container ${scrollbarClasses}`}
      sx={{
        flex: 1,
        overflow: 'hidden',
        '& .xterm': {
          height: '100% !important',
        },
        '& .xterm-viewport': {
          background: 'transparent !important',
        },
        '& .xterm-screen': {
          background: 'transparent !important',
        },
      }}
    />
  );
};