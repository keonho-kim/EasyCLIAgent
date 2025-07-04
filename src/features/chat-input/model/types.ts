export interface AtCommandPart {
  type: 'text' | 'atPath';
  content: string;
  startIndex: number;
  endIndex: number;
}

export interface CompletionItem {
  id: string;
  label: string;
  detail?: string;
  insertText: string;
  kind: 'file' | 'folder' | 'command';
  sortText?: string;
}

export interface SlashCommand {
  command: string;
  description: string;
  aliases?: string[];
  subCommands?: string[];
}

export interface AutocompleteState {
  isOpen: boolean;
  items: CompletionItem[];
  selectedIndex: number;
  trigger: 'at' | 'slash' | null;
  query: string;
  startPos: number;
  endPos: number;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  workspaceDir: string;
  aiTool?: 'gemini' | 'claude';
  disabled?: boolean;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}