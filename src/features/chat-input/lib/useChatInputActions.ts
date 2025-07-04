/**
 * Chat input actions hook
 * 메시지 전송, 터미널 인터럽트 등의 액션들을 관리 (SRP 준수)
 */

import { useCallback } from 'react';
import type { InputHistoryManager } from './useInputHistory';

interface UseChatInputActionsProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  historyManager: InputHistoryManager;
  setMessage: (message: string) => void;
}

export const useChatInputActions = ({
  onSendMessage,
  disabled,
  historyManager,
  setMessage,
}: UseChatInputActionsProps) => {
  // 메시지 전송
  const handleSend = useCallback((message: string) => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      historyManager.addToHistory(message.trim());
      setMessage('');
    }
  }, [disabled, onSendMessage, historyManager, setMessage]);

  // 터미널에 별도 Enter 입력 전송
  const handleSendEnter = useCallback(async () => {
    try {
      await window.electronAPI.sendTerminalInput('\r');
    } catch (error) {
      console.error('Failed to send enter to terminal:', error);
    }
  }, []);

  // 터미널 인터럽트
  const handleInterrupt = useCallback(async () => {
    try {
      const result = await window.electronAPI.interruptTerminal();
      if (!result.success) {
        console.error('Failed to interrupt terminal:', result.error);
      }
    } catch (error) {
      console.error('Failed to interrupt terminal:', error);
    }
  }, []);

  return {
    handleSend,
    handleSendEnter,
    handleInterrupt,
  };
};