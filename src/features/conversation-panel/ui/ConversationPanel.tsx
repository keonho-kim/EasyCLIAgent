/**
 * Conversation Panel Component
 * 대화 패널 메인 컴포넌트 (SRP: 레이아웃과 조합만 담당)
 */

import React from 'react';
import { Box } from '@mui/material';
import { useConversationStore } from '../../../stores/conversationStore';
import { useAppStore } from '../../../stores/appStore';
import { useConversationState } from '../lib/useConversationState';
import { ConversationHeader } from './ConversationHeader';
import { ConversationList } from './ConversationList';
import type { ConversationPanelProps } from '../model/types';

export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  workspacePath,
  onClose,
}) => {
  const { uiState } = useAppStore();
  const { theme, fontSize } = uiState;

  const { entries, clearHistory, deleteEntry, isCapturing } = useConversationStore(workspacePath);
  const conversationState = useConversationState();

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
        border: '1px solid',
        borderColor: theme === 'dark' ? '#444' : '#ddd',
        transition: 'none !important', // Disable animations
        '& *': {
          transition: 'none !important', // Disable all child animations
        }
      }}
    >
      {/* Panel Header */}
      <ConversationHeader
        entriesCount={entries.length}
        onClear={clearHistory}
        onClose={onClose}
        theme={theme}
      />

      {/* Conversation List */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <ConversationList
          entries={entries}
          expandedEntries={conversationState.expandedEntries}
          selectedEntryId={conversationState.selectedEntryId}
          theme={theme}
          fontSize={fontSize}
          onToggleExpanded={conversationState.toggleExpanded}
          onSelect={conversationState.setSelectedEntryId}
        />
      </Box>
    </Box>
  );
};