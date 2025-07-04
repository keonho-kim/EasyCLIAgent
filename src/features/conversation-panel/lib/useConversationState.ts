/**
 * Conversation State Management Hook
 * 대화 패널의 상태를 관리하는 훅
 */

import { useState } from 'react';

export interface ConversationStateManager {
  selectedEntryId: string | null;
  expandedEntries: Set<string>;
  setSelectedEntryId: (id: string | null) => void;
  toggleExpanded: (entryId: string) => void;
  selectAndExpand: (entryId: string) => void;
}

export const useConversationState = (): ConversationStateManager => {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const toggleExpanded = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const selectAndExpand = (entryId: string) => {
    const isSelected = selectedEntryId === entryId;
    setSelectedEntryId(isSelected ? null : entryId);
    toggleExpanded(entryId);
  };

  return {
    selectedEntryId,
    expandedEntries,
    setSelectedEntryId,
    toggleExpanded,
    selectAndExpand,
  };
};