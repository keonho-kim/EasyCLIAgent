/**
 * Instruction Editor Modal
 * AI instruction 파일 편집 모달
 * 컴포넌트 조합 및 이벤트 처리
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, Box, Alert } from '@mui/material';
import { useAppStore } from '../../../stores/appStore';
import { useInstructionFile } from '../hooks/useInstructionFile';
import { useTextHistory } from '../hooks/useTextHistory';
import { EditorToolbar } from './EditorToolbar';
import { TextEditor, TextEditorHandle } from './TextEditor';
import type { InstructionEditorProps } from '../types';

interface InstructionEditorModalProps extends InstructionEditorProps {
  open: boolean;
}

export const InstructionEditorModal: React.FC<InstructionEditorModalProps> = ({
  workspacePath,
  aiTool,
  open,
  onClose,
}) => {
  const { uiState } = useAppStore();
  const { theme, fontSize } = uiState;
  
  const fileManager = useInstructionFile();
  const history = useTextHistory();
  const editorRef = useRef<TextEditorHandle>(null);

  // 파일 로드
  useEffect(() => {
    if (open) {
      fileManager.loadFile(workspacePath, aiTool);
      history.clear();
    }
  }, [open, workspacePath, aiTool]);

  // 로드된 컨텐츠를 에디터에 설정
  useEffect(() => {
    if (fileManager.content !== null && editorRef.current) {
      editorRef.current.setValue(fileManager.content);
      history.addToHistory(fileManager.content);
    }
  }, [fileManager.content]);

  // 텍스트 변경 처리
  const handleTextChange = useCallback((text: string) => {
    fileManager.setContent(text);
    history.addToHistory(text);
  }, [fileManager, history]);

  // 저장
  const handleSave = useCallback(async () => {
    const content = editorRef.current?.getValue() || '';
    await fileManager.saveFile(content);
  }, [fileManager]);

  // Undo
  const handleUndo = useCallback(() => {
    const previousText = history.undo();
    if (previousText !== null && editorRef.current) {
      editorRef.current.setValue(previousText);
      fileManager.setContent(previousText);
    }
  }, [history, fileManager]);

  // Redo
  const handleRedo = useCallback(() => {
    const nextText = history.redo();
    if (nextText !== null && editorRef.current) {
      editorRef.current.setValue(nextText);
      fileManager.setContent(nextText);
    }
  }, [history, fileManager]);

  // Reset
  const handleReset = useCallback(() => {
    fileManager.reset();
    if (editorRef.current) {
      editorRef.current.setValue(fileManager.originalContent);
    }
  }, [fileManager]);

  // 키보드 단축키
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

    if (isCtrlOrCmd) {
      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          handleSave();
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
          break;
      }
    } else if (e.key === 'Escape' && onClose) {
      e.preventDefault();
      onClose();
    }
  }, [handleSave, handleUndo, handleRedo, onClose]);

  const title = `${aiTool.toUpperCase()}.md`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          width: '90vw',
          height: '90vh',
          m: 2,
        },
      }}
    >
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        <EditorToolbar
          title={title}
          isModified={fileManager.isModified}
          isSaving={fileManager.isSaving}
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          onSave={handleSave}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onReset={handleReset}
          onClose={onClose}
        />
        
        {fileManager.error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {fileManager.error}
          </Alert>
        )}
        
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <TextEditor
            ref={editorRef}
            defaultValue={fileManager.content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={`${aiTool.toUpperCase()} instruction을 입력하세요...`}
            theme={theme}
            fontSize={fontSize}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};