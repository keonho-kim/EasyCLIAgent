/**
 * Text Editor Component
 * 텍스트 편집기 UI
 * SRP: 텍스트 입력 UI만 담당
 */

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Box } from '@mui/material';

interface TextEditorProps {
  defaultValue: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  theme: 'light' | 'dark';
  fontSize: number;
}

export interface TextEditorHandle {
  getValue: () => string;
  setValue: (value: string) => void;
  focus: () => void;
}

export const TextEditor = forwardRef<TextEditorHandle, TextEditorProps>(
  ({ defaultValue, onChange, onKeyDown, placeholder, theme, fontSize }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => textareaRef.current?.value || '',
      setValue: (value: string) => {
        if (textareaRef.current) {
          textareaRef.current.value = value;
        }
      },
      focus: () => textareaRef.current?.focus(),
    }));

    return (
      <Box sx={{ height: '100%', p: 2 }}>
        <textarea
          ref={textareaRef}
          defaultValue={defaultValue}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          style={{
            width: '100%',
            height: '100%',
            padding: '16px',
            border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
            borderRadius: '4px',
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            fontFamily: 'Fira Code, Monaco, Consolas, monospace',
            fontSize: fontSize,
            lineHeight: 1.6,
            resize: 'none',
            outline: 'none',
          }}
        />
      </Box>
    );
  }
);

TextEditor.displayName = 'TextEditor';