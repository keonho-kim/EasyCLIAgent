/**
 * Chat input keyboard event handler hook
 * 키보드 이벤트 처리 로직을 관리 (SRP 준수)
 */

import { useCallback } from 'react';
import type { InputHistoryManager } from './useInputHistory';
import type { AutoCompleteManager } from './useAutoComplete';

interface UseChatInputKeyHandlerProps {
  isComposing: boolean;
  autoCompleteManager: AutoCompleteManager;
  message: string;
  setMessage: (message: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  historyManager: InputHistoryManager;
  handleSend: (message: string) => void;
  handleSendEnter: () => Promise<void>;
}

export const useChatInputKeyHandler = ({
  isComposing,
  autoCompleteManager,
  message,
  setMessage,
  inputRef,
  historyManager,
  handleSend,
  handleSendEnter,
}: UseChatInputKeyHandlerProps) => {
  return useCallback(async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComposing) return;

    switch (e.key) {
      case 'Enter':
        if (e.shiftKey) {
          // Shift+Enter: 줄바꿈 허용
          return;
        }
        
        if (autoCompleteManager.autocomplete.isOpen) {
          e.preventDefault();
          const selectedItem = autoCompleteManager.autocomplete.items[autoCompleteManager.autocomplete.selectedIndex];
          if (selectedItem) {
            const { newMessage, newCursorPos } = autoCompleteManager.handleAutocompleteSelect(selectedItem, message);
            setMessage(newMessage);
            setTimeout(() => {
              inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
            });
          }
        } else {
          e.preventDefault();
          handleSend(message);
          // 메시지 전송 후 짧은 딜레이 후 별도로 Enter 입력 전송
          setTimeout(async () => {
            await handleSendEnter();
          }, 50);
        }
        break;

      case 'ArrowUp':
        if (autoCompleteManager.autocomplete.isOpen) {
          e.preventDefault();
          autoCompleteManager.navigateAutocomplete(-1);
        } else if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const newMessage = historyManager.navigateHistory(-1, message);
          setMessage(newMessage);
        }
        break;

      case 'ArrowDown':
        if (autoCompleteManager.autocomplete.isOpen) {
          e.preventDefault();
          autoCompleteManager.navigateAutocomplete(1);
        } else if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const newMessage = historyManager.navigateHistory(1, message);
          setMessage(newMessage);
        }
        break;

      case 'Escape':
        if (autoCompleteManager.autocomplete.isOpen) {
          e.preventDefault();
          autoCompleteManager.cancelAutocompleteClose();
          autoCompleteManager.closeAutocomplete();
        }
        break;

      case ' ':
        if (autoCompleteManager.autocomplete.isOpen) {
          e.preventDefault();
          // 스페이스 문자를 직접 입력하고 자동완성 닫기
          const newMessage = message + ' ';
          setMessage(newMessage);
          autoCompleteManager.cancelAutocompleteClose();
          autoCompleteManager.closeAutocomplete();
        }
        break;
    }
  }, [
    isComposing,
    autoCompleteManager,
    message,
    setMessage,
    inputRef,
    historyManager,
    handleSend,
    handleSendEnter,
  ]);
};