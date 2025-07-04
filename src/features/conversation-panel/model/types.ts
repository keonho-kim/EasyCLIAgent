import type { ConversationEntry } from '../../../shared/types/conversation';

export interface ConversationPanelProps {
  workspacePath?: string;
  onClose?: () => void;
}

export interface ConversationEntryItemProps {
  index: number;
  style: React.CSSProperties;
  entry: ConversationEntry;
  isExpanded: boolean;
  isSelected: boolean;
  theme: 'light' | 'dark';
  fontSize: number;
  onToggleExpanded: (entryId: string) => void;
  onSelect: (entryId: string) => void;
}

export interface ConversationHeaderProps {
  entriesCount: number;
  onClear: () => void;
  onClose?: () => void;
  theme: 'light' | 'dark';
}

export interface ConversationListProps {
  entries: ConversationEntry[];
  expandedEntries: Set<string>;
  selectedEntryId: string | null;
  theme: 'light' | 'dark';
  fontSize: number;
  onToggleExpanded: (entryId: string) => void;
  onSelect: (entryId: string | null) => void;
}

export interface AIToolInfo {
  icon: string;
  color: string;
  label: string;
}