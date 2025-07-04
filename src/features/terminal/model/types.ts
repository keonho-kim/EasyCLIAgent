import type { Terminal } from '@xterm/xterm';
import type { FitAddon } from '@xterm/addon-fit';

export interface SimpleTerminalProps {
  workspaceDir: string;
  aiTool?: 'gemini' | 'claude';
  onFocus?: () => void;
  onTerminalData?: (data: string) => void;
  onHistoryToggle?: () => void;
  isHistoryOpen?: boolean;
  onInstructionEdit?: () => void;
}

export interface TerminalHeaderProps {
  onHistoryToggle?: () => void;
  isHistoryOpen?: boolean;
  onFullscreenToggle: () => void;
  isFullscreen: boolean;
  onInstructionEdit?: () => void;
  theme: 'light' | 'dark';
  title: string;
}

export interface TerminalEngineProps {
  workspaceDir: string;
  aiTool: 'gemini' | 'claude';
  theme: 'light' | 'dark';
  fontSize: number;
  onFocus?: () => void;
  onTerminalData?: (data: string) => void;
  isScrolling: boolean;
  onScrollingChange: (scrolling: boolean) => void;
}

export interface TerminalContainerProps {
  workspaceDir: string;
  aiTool?: 'gemini' | 'claude';
  onFocus?: () => void;
  onTerminalData?: (data: string) => void;
  onHistoryToggle?: () => void;
  isHistoryOpen?: boolean;
  onInstructionEdit?: () => void;
}

export interface TerminalConfig {
  theme: {
    background: string;
    foreground: string;
    cursor: string;
    selection: string;
    black: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    white: string;
    brightBlack: string;
    brightRed: string;
    brightGreen: string;
    brightYellow: string;
    brightBlue: string;
    brightMagenta: string;
    brightCyan: string;
    brightWhite: string;
  };
  fontSize: number;
  fontFamily: string;
  cursorBlink: boolean;
  cursorStyle: 'block' | 'underline' | 'bar';
  allowTransparency: boolean;
  scrollback: number;
  rightClickSelectsWord: boolean;
  macOptionIsMeta: boolean;
}

export interface TerminalState {
  terminal: Terminal | null;
  fitAddon: FitAddon | null;
  isFullscreen: boolean;
  isScrolling: boolean;
}