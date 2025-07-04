/**
 * Terminal Container Component
 * 터미널 메인 컨테이너 (SRP: 레이아웃과 조합만 담당)
 */

import React, { useEffect, useCallback } from 'react';
import { Paper } from '@mui/material';
import type { Terminal } from '@xterm/xterm';
import type { FitAddon } from '@xterm/addon-fit';
import { useAppStore } from '../../../stores/appStore';
import { useTerminalState } from '../lib/useTerminalState';
import { TerminalHeader } from './TerminalHeader';
import { TerminalEngine } from './TerminalEngine';
import type { TerminalContainerProps } from '../model/types';

export const TerminalContainer: React.FC<TerminalContainerProps> = ({
  workspaceDir,
  aiTool = 'gemini',
  onFocus,
  onTerminalData,
  onHistoryToggle,
  isHistoryOpen,
  onInstructionEdit,
}) => {
  const { uiState } = useAppStore();
  const { fontSize, theme } = uiState;
  const terminalState = useTerminalState();

  // Handle terminal ready callback
  const handleTerminalReady = useCallback((terminal: Terminal, fitAddon: FitAddon) => {
    terminalState.setTerminal(terminal);
    terminalState.setFitAddon(fitAddon);
  }, [terminalState.setTerminal, terminalState.setFitAddon]);

  // Handle instruction edit
  const handleInstructionEdit = useCallback(() => {
    if (onInstructionEdit) {
      onInstructionEdit();
    }
  }, [onInstructionEdit]);

  // Auto-resize on container size change
  useEffect(() => {
    const resizeTerminal = () => {
      if (terminalState.state.fitAddon && terminalState.state.terminal) {
        try {
          terminalState.state.fitAddon.fit();
        } catch (error) {
          console.warn('Terminal fit error:', error);
        }
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      setTimeout(resizeTerminal, 100);
    });

    // We need to observe the terminal container, but we can't access the ref here
    // This will be handled by the TerminalEngine component
    return () => {
      resizeObserver.disconnect();
    };
  }, [terminalState.state.fitAddon, terminalState.state.terminal]);

  return (
    <Paper
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
        border: '1px solid',
        borderColor: theme === 'dark' ? '#444' : '#ddd',
        ...(terminalState.state.isFullscreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
        }),
      }}
    >
      {/* Terminal Header */}
      <TerminalHeader
        title={workspaceDir}
        onInstructionEdit={handleInstructionEdit}
        onHistoryToggle={onHistoryToggle}
        isHistoryOpen={isHistoryOpen}
        onFullscreenToggle={terminalState.toggleFullscreen}
        isFullscreen={terminalState.state.isFullscreen}
        theme={theme}
      />

      {/* Terminal Engine */}
      <TerminalEngine
        workspaceDir={workspaceDir}
        aiTool={aiTool}
        theme={theme}
        fontSize={fontSize}
        onFocus={onFocus}
        onTerminalData={onTerminalData}
        isScrolling={terminalState.state.isScrolling}
        onScrollingChange={terminalState.setScrolling}
        onTerminalReady={handleTerminalReady}
      />
    </Paper>
  );
};