/**
 * Conversation List Component  
 * 가상화된 대화 목록 관리 (SRP: 목록 표시와 가상화만 담당)
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { VariableSizeList as VirtualList } from 'react-window';
import { ConversationEntry } from './ConversationEntry';
import { getItemHeight } from '../lib/conversationUtils';
import type { ConversationListProps } from '../model/types';

export const ConversationList: React.FC<ConversationListProps> = ({
  entries,
  expandedEntries,
  selectedEntryId,
  theme,
  fontSize,
  onToggleExpanded,
  onSelect,
}) => {
  // Empty state
  if (entries.length === 0) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 1,
          opacity: 0.6,
        }}
      >
        <ChatIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary" textAlign="center">
          대화 내역이 없습니다
        </Typography>
        <Typography variant="caption" color="text.secondary" textAlign="center">
          명령어를 입력하면 대화 내역이 기록됩니다
        </Typography>
      </Box>
    );
  }

  // Virtual list item renderer
  const ConversationEntryItem: React.FC<{
    index: number;
    style: React.CSSProperties;
  }> = ({ index, style }) => {
    const entry = entries[index];
    const isExpanded = expandedEntries.has(entry.id);
    const isSelected = selectedEntryId === entry.id;

    return (
      <ConversationEntry
        index={index}
        style={style}
        entry={entry}
        isExpanded={isExpanded}
        isSelected={isSelected}
        theme={theme}
        fontSize={fontSize}
        onToggleExpanded={onToggleExpanded}
        onSelect={(entryId) => {
          const isCurrentlySelected = selectedEntryId === entryId;
          onSelect(isCurrentlySelected ? null : entryId);
          onToggleExpanded(entryId);
        }}
      />
    );
  };

  return (
    <VirtualList
      height={400}
      width="100%"
      itemCount={entries.length}
      itemSize={(index) => {
        const entry = entries[index];
        return getItemHeight(entry.id, expandedEntries);
      }}
      itemData={entries}
      style={{ height: '100%' }}
    >
      {ConversationEntryItem}
    </VirtualList>
  );
};