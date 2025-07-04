/**
 * ChatInput Component
 * 채팅 입력을 위한 메인 컴포넌트 (SRP 준수)
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AutocompleteDropdown } from './AutocompleteDropdown';
import { ChatInputButtons } from './ChatInputButtons';
import { useInputHistory } from '../lib/useInputHistory';
import { useAutoComplete } from '../lib/useAutoComplete';
import { useChatInputActions } from '../lib/useChatInputActions';
import { useChatInputKeyHandler } from '../lib/useChatInputKeyHandler';
import type { ChatInputProps } from '../model/types';

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  workspaceDir,
  aiTool = 'gemini',
  disabled = false,
  placeholder,
  onFocus,
  onBlur,
}) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const lastTriggerRef = useRef<number>(0);
  
  // 커스텀 훅들 사용
  const historyManager = useInputHistory();
  const autoCompleteManager = useAutoComplete(workspaceDir, aiTool);
  const { handleSend, handleSendEnter, handleInterrupt } = useChatInputActions({
    onSendMessage,
    disabled,
    historyManager,
    setMessage,
  });

  // 키보드 이벤트 처리
  const handleKeyDown = useChatInputKeyHandler({
    isComposing,
    autoCompleteManager,
    message,
    setMessage,
    inputRef,
    historyManager,
    handleSend: (msg: string) => handleSend(msg),
    handleSendEnter,
  });

  // 입력 변경 처리
  const handleInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    historyManager.resetHistoryIndex();

    // IME 조합 중에는 자동완성을 트리거하지 않음
    if (!isComposing) {
      // 디바운싱: 50ms 이내의 중복 호출 방지
      const now = Date.now();
      if (now - lastTriggerRef.current > 50) {
        lastTriggerRef.current = now;
        const cursorPos = e.target.selectionStart || 0;
        await autoCompleteManager.triggerAutocomplete(newValue, cursorPos);
      }
    }
  }, [historyManager, autoCompleteManager, isComposing]);

  // 커서 위치 변경 처리
  const handleSelectionChange = useCallback(async () => {
    // IME 조합 중이거나 자동완성이 이미 열려있으면 스킵
    if (isComposing || autoCompleteManager.autocomplete.isOpen) {
      return;
    }
    
    if (inputRef.current) {
      const cursorPos = inputRef.current.selectionStart || 0;
      await autoCompleteManager.triggerAutocomplete(message, cursorPos);
    }
  }, [message, autoCompleteManager, isComposing]);

  // Blur 이벤트 처리 - 자동완성이 열려있을 때는 닫지 않음
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // 자동완성 드롭다운으로 포커스가 이동하는 경우 무시
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && relatedTarget.closest('[data-autocomplete-dropdown]')) {
      return;
    }
    
    // 사용자 정의 onBlur 콜백 호출
    if (onBlur) {
      onBlur();
    }
  }, [onBlur]);

  return (
    <Box sx={{ position: 'relative' }}>
      {/* 자동완성 드롭다운 */}
      {autoCompleteManager.autocomplete.isOpen && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
          onMouseEnter={() => autoCompleteManager.cancelAutocompleteClose()}
          onMouseLeave={() => autoCompleteManager.closeAutocompleteWithDelay(800)}
          data-autocomplete-dropdown
        >
          <AutocompleteDropdown
            items={autoCompleteManager.autocomplete.items}
            selectedIndex={autoCompleteManager.autocomplete.selectedIndex}
            onSelect={(item: any) => {
              const { newMessage, newCursorPos } = autoCompleteManager.handleAutocompleteSelect(item, message);
              setMessage(newMessage);
              setTimeout(() => {
                inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
              });
            }}
            onHover={(index: number) => autoCompleteManager.setSelectedIndex(index)}
          />
        </Box>
      )}

      <TextField
        ref={inputRef}
        fullWidth
        multiline
        maxRows={6}
        variant="outlined"
        placeholder={placeholder || t('terminal.placeholder')}
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onSelect={handleSelectionChange}
        onCompositionStart={() => {
          console.log('[ChatInput] IME composition started');
          setIsComposing(true);
        }}
        onCompositionEnd={async (e) => {
          console.log('[ChatInput] IME composition ended');
          setIsComposing(false);
          // 조합이 끝난 후 자동완성 트리거
          const target = e.target as HTMLInputElement;
          const cursorPos = target.selectionStart || 0;
          await autoCompleteManager.triggerAutocomplete(message, cursorPos);
        }}
        onFocus={onFocus}
        onBlur={handleBlur}
        disabled={disabled}
        InputProps={{
          endAdornment: (
            <ChatInputButtons
              disabled={disabled}
              message={message}
              onSend={() => handleSend(message)}
              onInterrupt={handleInterrupt}
            />
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            paddingRight: 1,
          },
        }}
      />

      {/* Help text */}
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          <strong>@</strong> 파일/폴더 • <strong>/</strong> 명령어 • <strong>Shift+Enter</strong> 줄바꿈
        </Typography>
        {autoCompleteManager.autocomplete.isOpen && (
          <Typography variant="caption" color="primary.main">
            {autoCompleteManager.autocomplete.items.length}개 항목
          </Typography>
        )}
      </Box>
    </Box>
  );
};