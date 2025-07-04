/**
 * Terminal Configuration
 * xterm.js 터미널 설정 관련 유틸리티
 */

import type { TerminalConfig } from '../model/types';

export const createTerminalConfig = (theme: 'light' | 'dark', fontSize: number): TerminalConfig => {
  return {
    theme: {
      background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
      foreground: theme === 'dark' ? '#ffffff' : '#000000',
      cursor: theme === 'dark' ? '#ffffff' : '#000000',
      selection: theme === 'dark' ? '#3e4b59' : '#b3d9ff',
      black: '#000000',
      red: '#ff5555',
      green: '#50fa7b',
      yellow: '#f1fa8c',
      blue: '#bd93f9',
      magenta: '#ff79c6',
      cyan: '#8be9fd',
      white: '#bfbfbf',
      brightBlack: '#4d4d4d',
      brightRed: '#ff6e67',
      brightGreen: '#5af78e',
      brightYellow: '#f4f99d',
      brightBlue: '#caa9fa',
      brightMagenta: '#ff92d0',
      brightCyan: '#9aedfe',
      brightWhite: theme === 'dark' ? '#ffffff' : '#000000',
    },
    fontSize: fontSize - 2,
    fontFamily: 'Fira Code, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    cursorBlink: true,
    cursorStyle: 'block',
    allowTransparency: true,
    scrollback: 1000,
    rightClickSelectsWord: true,
    macOptionIsMeta: true,
  };
};