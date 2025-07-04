/**
 * Conversation Entry Component
 * 개별 대화 항목 표시 (SRP: 단일 대화 항목 렌더링만 담당)
 */

import React from 'react';
import {
  Box,
  Typography,
  ListItem,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Person as UserIcon,
  Android as AIIcon,
  AccessTime as TimeIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
} from '@mui/icons-material';
import type { ConversationEntryItemProps } from '../model/types';
import { formatTime, getAIToolInfo } from '../lib/conversationUtils';

export const ConversationEntry: React.FC<ConversationEntryItemProps> = ({
  index,
  style,
  entry,
  isExpanded,
  isSelected,
  theme,
  fontSize,
  onToggleExpanded,
  onSelect,
}) => {
  const aiToolInfo = getAIToolInfo(entry.aiTool);

  return (
    <div style={style}>
      <ListItem
        sx={{
          flexDirection: 'column',
          alignItems: 'stretch',
          py: 1,
          px: 2,
          borderBottom: '1px solid',
          borderBottomColor: theme === 'dark' ? '#333' : '#eee',
          backgroundColor: isSelected 
            ? (theme === 'dark' ? '#1a2332' : '#e3f2fd')
            : 'transparent',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: isSelected
              ? (theme === 'dark' ? '#1a2332' : '#e3f2fd')
              : (theme === 'dark' ? '#2a2a2a' : '#f5f5f5'),
          },
        }}
        onClick={() => onSelect(entry.id)}
      >
        {/* Entry Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {/* Expand/Collapse Icon */}
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpanded(entry.id);
            }}
            sx={{ p: 0.25 }}
          >
            {isExpanded ? 
              <CollapseIcon sx={{ fontSize: 16 }} /> : 
              <ExpandIcon sx={{ fontSize: 16 }} />
            }
          </IconButton>
          
          <Chip
            icon={<span style={{ fontSize: '12px' }}>{aiToolInfo.icon}</span>}
            label={aiToolInfo.label}
            size="small"
            variant="outlined"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              color: aiToolInfo.color,
              borderColor: aiToolInfo.color,
            }}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
            <TimeIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.7rem' }}
            >
              {formatTime(entry.timestamp)}
            </Typography>
          </Box>
        </Box>

        {/* Collapsed View - Show preview */}
        {!isExpanded && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: fontSize - 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {entry.input.length > 50 ? `${entry.input.substring(0, 50)}...` : entry.input}
          </Typography>
        )}

        {/* Expanded View - Show full input and output */}
        {isExpanded && (
          <>
            {/* User Input */}
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <UserIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 'bold', color: 'primary.main' }}
                >
                  입력
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontSize: fontSize - 2,
                  fontFamily: 'Fira Code, monospace',
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa',
                  border: '1px solid',
                  borderColor: theme === 'dark' ? '#333' : '#e0e0e0',
                  borderRadius: 1,
                  p: 1,
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {entry.input}
              </Typography>
            </Box>

            {/* AI Output */}
            {entry.output && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <AIIcon sx={{ fontSize: 14, color: aiToolInfo.color }} />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 'bold', color: aiToolInfo.color }}
                  >
                    응답
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: fontSize - 2,
                    fontFamily: 'Fira Code, monospace',
                    backgroundColor: theme === 'dark' ? '#0f1419' : '#fafbfc',
                    border: '1px solid',
                    borderColor: theme === 'dark' ? '#333' : '#e0e0e0',
                    borderRadius: 1,
                    p: 1,
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  {entry.output}
                </Typography>
              </Box>
            )}
          </>
        )}
      </ListItem>
    </div>
  );
};