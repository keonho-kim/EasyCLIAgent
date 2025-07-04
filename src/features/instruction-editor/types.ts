/**
 * Instruction Editor Types
 * AI instruction 파일 편집기 타입 정의
 */

export interface InstructionFile {
  path: string;
  content: string;
  aiTool: 'claude' | 'gemini';
}

export interface InstructionEditorState {
  content: string;
  originalContent: string;
  isModified: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export interface InstructionEditorProps {
  workspacePath: string;
  aiTool: 'claude' | 'gemini';
  onClose?: () => void;
}