/**
 * Auto Complete Management Hook
 * 자동완성 기능을 관리하는 훅
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { FileCompletionService } from './fileCompletionService';
import { findSlashCommands } from './slashCommands';
import { extractAtCommandAtPosition } from './atCommandProcessor';
import type { AutocompleteState, CompletionItem } from '../model/types';

export interface AutoCompleteManager {
  autocomplete: AutocompleteState;
  triggerAutocomplete: (text: string, cursorPos: number) => Promise<void>;
  handleAutocompleteSelect: (item: CompletionItem, message: string) => {
    newMessage: string;
    newCursorPos: number;
  };
  closeAutocomplete: () => void;
  closeAutocompleteWithDelay: (delay?: number) => void;
  cancelAutocompleteClose: () => void;
  navigateAutocomplete: (direction: 1 | -1) => void;
  setSelectedIndex: (index: number) => void;
}

export const useAutoComplete = (
  workspaceDir: string,
  aiTool: 'gemini' | 'claude' = 'gemini'
): AutoCompleteManager => {
  const [autocomplete, setAutocomplete] = useState<AutocompleteState>({
    isOpen: false,
    items: [],
    selectedIndex: 0,
    trigger: null,
    query: '',
    startPos: 0,
    endPos: 0,
  });

  // 디버깅을 위한 로깅 함수
  const setAutocompleteWithLogging = useCallback((updater: any) => {
    setAutocomplete((prev) => {
      const newState = typeof updater === 'function' ? updater(prev) : updater;
      if (!newState.isOpen && prev.isOpen) {
        console.warn('[AutoComplete] Dropdown is being closed!');
        console.trace();
      } else if (newState.isOpen && !prev.isOpen) {
        console.log('[AutoComplete] Dropdown is being opened!', {
          trigger: newState.trigger,
          itemCount: newState.items.length,
        });
      }
      return newState;
    });
  }, []);

  const fileCompletionService = useRef<FileCompletionService | null>(null);
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // FileCompletionService 초기화
  useEffect(() => {
    if (workspaceDir && !fileCompletionService.current) {
      fileCompletionService.current = new FileCompletionService(workspaceDir);
    }
  }, [workspaceDir]);

  const cancelAutocompleteClose = useCallback(() => {
    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
      autocompleteTimeoutRef.current = null;
    }
  }, []);

  const closeAutocomplete = useCallback(() => {
    console.log('[AutoComplete] closeAutocomplete called');
    setAutocompleteWithLogging((prev: AutocompleteState) => ({ ...prev, isOpen: false }));
  }, [setAutocompleteWithLogging]);

  const closeAutocompleteWithDelay = useCallback((delay: number = 1000) => {
    cancelAutocompleteClose();
    autocompleteTimeoutRef.current = setTimeout(() => {
      closeAutocomplete();
    }, delay);
  }, [cancelAutocompleteClose, closeAutocomplete]);

  const triggerAutocomplete = useCallback(async (text: string, cursorPos: number) => {
    console.log('[AutoComplete] triggerAutocomplete called', { text, cursorPos });
    cancelAutocompleteClose();
    
    // @ 명령어 체크 (파일/폴더 완성)
    const atCommand = extractAtCommandAtPosition(text, cursorPos);
    if (atCommand && fileCompletionService.current) {
      console.log('[AutoComplete] @ command detected', atCommand);
      
      // 경로 기반 탐색을 위해 basePath와 searchQuery 사용
      const items = await fileCompletionService.current.getFileCompletions(
        atCommand.searchQuery || '', 
        atCommand.basePath || ''
      );
      
      if (items.length > 0) {
        setAutocompleteWithLogging({
          isOpen: true,
          items,
          selectedIndex: 0,
          trigger: 'at',
          query: atCommand.command.substring(1), // @ 제거
          startPos: atCommand.start,
          endPos: atCommand.end,
        });
      } else {
        // 폴더 경로를 입력 중일 때는 드롭다운 유지
        if (atCommand.isPath) {
          setAutocompleteWithLogging({
            isOpen: true,
            items: [],
            selectedIndex: 0,
            trigger: 'at',
            query: atCommand.command.substring(1),
            startPos: atCommand.start,
            endPos: atCommand.end,
          });
        }
      }
      // items가 없어도 닫지 않음 - 사용자가 아직 입력 중일 수 있음
      return;
    }

    // / 명령어 체크 (슬래시 명령어)
    const beforeCursor = text.substring(0, cursorPos);
    const slashMatch = beforeCursor.match(/\/([^\s]*)$/);
    if (slashMatch) {
      console.log('[AutoComplete] / command detected', slashMatch[0]);
      const query = slashMatch[0];
      const matchingCommands = findSlashCommands(query, aiTool);
      
      const items: CompletionItem[] = matchingCommands.map((cmd: any) => ({
        id: cmd.command,
        label: cmd.command,
        detail: cmd.description,
        insertText: cmd.command,
        kind: 'command',
      }));

      if (items.length > 0) {
        setAutocompleteWithLogging({
          isOpen: true,
          items,
          selectedIndex: 0,
          trigger: 'slash',
          query,
          startPos: cursorPos - query.length,
          endPos: cursorPos,
        });
      }
      // items가 없어도 닫지 않음 - 사용자가 아직 입력 중일 수 있음
      return;
    }

    // 현재 열려있고, 더 이상 조건을 만족하지 않는 경우에만 닫기
    if (autocomplete.isOpen && autocomplete.trigger) {
      console.log('[AutoComplete] No matching trigger found, closing dropdown');
      closeAutocomplete();
    }
  }, [workspaceDir, aiTool, cancelAutocompleteClose, closeAutocomplete, autocomplete.isOpen, autocomplete.trigger, setAutocompleteWithLogging]);

  const handleAutocompleteSelect = useCallback((item: CompletionItem, message: string) => {
    console.log('[AutoComplete] Item selected', item);
    cancelAutocompleteClose();
    
    if (autocomplete.trigger === 'at') {
      // @ 명령어 교체
      const beforeAt = message.substring(0, autocomplete.startPos);
      const afterCommand = message.substring(autocomplete.endPos);
      const newMessage = beforeAt + item.insertText + afterCommand;
      const newCursorPos = beforeAt.length + item.insertText.length;
      
      // 폴더를 선택한 경우 (insertText가 /로 끝남)
      if (item.kind === 'folder' && item.insertText.endsWith('/')) {
        // 드롭다운을 닫지 않고 계속 탐색 가능하도록 함
        // 새로운 위치에서 자동완성을 다시 트리거하기 위해 잠시 후 실행
        setTimeout(() => {
          triggerAutocomplete(newMessage, newCursorPos);
        }, 50);
      } else {
        // 파일을 선택한 경우 드롭다운 닫기
        setAutocompleteWithLogging((prev: AutocompleteState) => ({ ...prev, isOpen: false }));
      }
      
      return { newMessage, newCursorPos };
    } else if (autocomplete.trigger === 'slash') {
      // / 명령어 교체
      const beforeSlash = message.substring(0, autocomplete.startPos);
      const afterCommand = message.substring(autocomplete.endPos);
      const newMessage = beforeSlash + item.insertText + afterCommand;
      const newCursorPos = beforeSlash.length + item.insertText.length;
      
      setAutocompleteWithLogging((prev: AutocompleteState) => ({ ...prev, isOpen: false }));
      
      return { newMessage, newCursorPos };
    }
    
    return { newMessage: message, newCursorPos: 0 };
  }, [autocomplete, cancelAutocompleteClose, setAutocompleteWithLogging, triggerAutocomplete]);

  const navigateAutocomplete = useCallback((direction: 1 | -1) => {
    setAutocompleteWithLogging((prev: AutocompleteState) => {
      if (!prev.isOpen || prev.items.length === 0) return prev;
      
      const newIndex = direction === 1 
        ? Math.min(prev.selectedIndex + 1, prev.items.length - 1)
        : Math.max(prev.selectedIndex - 1, 0);
      
      return { ...prev, selectedIndex: newIndex };
    });
  }, [setAutocompleteWithLogging]);

  const setSelectedIndex = useCallback((index: number) => {
    setAutocompleteWithLogging((prev: AutocompleteState) => ({ ...prev, selectedIndex: index }));
  }, [setAutocompleteWithLogging]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autocompleteTimeoutRef.current) {
        clearTimeout(autocompleteTimeoutRef.current);
      }
    };
  }, []);

  return {
    autocomplete,
    triggerAutocomplete,
    handleAutocompleteSelect,
    closeAutocomplete,
    closeAutocompleteWithDelay,
    cancelAutocompleteClose,
    navigateAutocomplete,
    setSelectedIndex,
  };
};