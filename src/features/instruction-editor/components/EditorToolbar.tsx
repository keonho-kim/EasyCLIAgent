/**
 * Editor Toolbar Component
 * 에디터 툴바 UI
 * SRP: 툴바 UI 렌더링만 담당
 */

import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import {
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  RestartAlt as ResetIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface EditorToolbarProps {
  title: string;
  isModified: boolean;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onClose?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = React.memo(({
  title,
  isModified,
  isSaving,
  canUndo,
  canRedo,
  onSave,
  onUndo,
  onRedo,
  onReset,
  onClose,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6">{title}</Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={onSave}
            disabled={!isModified || isSaving}
            color={isModified ? 'primary' : 'default'}
            title="저장 (Ctrl/Cmd+S)"
          >
            <SaveIcon />
          </IconButton>
          
          <IconButton
            onClick={onUndo}
            disabled={!canUndo}
            title="실행 취소 (Ctrl/Cmd+Z)"
          >
            <UndoIcon />
          </IconButton>
          
          <IconButton
            onClick={onRedo}
            disabled={!canRedo}
            title="다시 실행 (Ctrl/Cmd+Shift+Z)"
          >
            <RedoIcon />
          </IconButton>
          
          <IconButton
            onClick={onReset}
            disabled={!isModified}
            title="원본으로 되돌리기"
          >
            <ResetIcon />
          </IconButton>
        </Box>
      </Box>
      
      {onClose && (
        <IconButton onClick={onClose} title="닫기 (ESC)">
          <CloseIcon />
        </IconButton>
      )}
    </Box>
  );
});