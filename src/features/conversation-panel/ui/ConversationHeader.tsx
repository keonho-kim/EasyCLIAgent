/**
 * Conversation Header Component
 * 대화 패널의 헤더 (SRP: 헤더 UI와 액션만 담당)
 */

import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Chat as ChatIcon,
  CleaningServices as ClearIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import type { ConversationHeaderProps } from '../model/types';

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  entriesCount,
  onClear,
  onClose,
  theme,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1,
        borderBottom: '1px solid',
        borderColor: theme === 'dark' ? '#444' : '#ddd',
        background: theme === 'dark' ? '#2d2d2d' : '#f5f5f5',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ChatIcon sx={{ fontSize: 20, color: 'primary.main' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          대화 내역
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {/* Clear conversation history */}
        <Tooltip title="대화 내역 클리어">
          <IconButton size="small" onClick={onClear}>
            <ClearIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        
        {/* Close panel */}
        {onClose && (
          <Tooltip title="대화 내역 닫기">
            <IconButton size="small" onClick={onClose}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}

        {/* Entry count */}
        <Badge badgeContent={entriesCount} color="primary" max={99}>
          <Box sx={{ width: 20, height: 20 }} />
        </Badge>
      </Box>
    </Box>
  );
};