/**
 * Terminal Header Component
 * 터미널 헤더 UI (SRP: 헤더 표시와 컨트롤만 담당)
 */

import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import {
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Notes as NotesIcon,
  Terminal as TerminalIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { TerminalHeaderProps } from '../model/types';

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  title,
  onFullscreenToggle,
  isFullscreen,
  onInstructionEdit,
  onOpenFolder,
  theme,
}) => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1,
        backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f5f5f5',
        borderBottom: '1px solid',
        borderColor: theme === 'dark' ? '#444' : '#ddd',
      }}
    >
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <TerminalIcon sx={{ ml: 1, fontSize: 20, color: 'text.secondary' }} />
      </Box>
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </Typography>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <Tooltip title={t('terminal.openFolder')}>
          <IconButton size="small" onClick={onOpenFolder}>
            <FolderIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={t('terminal.instructionEdit')}>
          <IconButton size="small" onClick={onInstructionEdit}>
            <NotesIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={isFullscreen ? t('terminal.exitFullscreen') : t('terminal.fullscreen')}>
          <IconButton size="small" onClick={onFullscreenToggle}>
            <FullscreenIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};