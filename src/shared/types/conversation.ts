/**
 * Conversation history types for terminal chat logging
 */

export interface ConversationEntry {
  id: string;
  timestamp: Date;
  input: string;
  output: string;
  isCompleted: boolean;
  aiTool: 'gemini' | 'claude';
}

export interface ConversationState {
  entries: ConversationEntry[];
  currentEntry: ConversationEntry | null;
  isCapturing: boolean;
  maxEntries: number; // For memory management
}