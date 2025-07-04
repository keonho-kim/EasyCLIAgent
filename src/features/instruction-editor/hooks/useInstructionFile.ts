/**
 * Instruction File Hook
 * CLAUDE.md / GEMINI.md 파일 읽기/쓰기 관리
 * SRP: 파일 I/O 책임만 담당
 */

import { useState, useCallback } from 'react';
import path from 'path-browserify';
import type { InstructionFile, InstructionEditorState } from '../types';

interface UseInstructionFileReturn extends InstructionEditorState {
  loadFile: (workspacePath: string, aiTool: 'claude' | 'gemini') => Promise<void>;
  saveFile: (content: string) => Promise<void>;
  setContent: (content: string) => void;
  reset: () => void;
}

export const useInstructionFile = (): UseInstructionFileReturn => {
  const [state, setState] = useState<InstructionEditorState>({
    content: '',
    originalContent: '',
    isModified: false,
    isLoading: false,
    isSaving: false,
    error: null,
  });

  const [currentFile, setCurrentFile] = useState<InstructionFile | null>(null);

  const loadFile = useCallback(async (workspacePath: string, aiTool: 'claude' | 'gemini') => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const fileName = aiTool === 'claude' ? 'CLAUDE.md' : 'GEMINI.md';
    const filePath = path.join(workspacePath, fileName);
    
    try {
      // Electron API를 사용하여 파일 읽기 (없으면 생성)
      const result = await window.electronAPI.readFileOrCreate(filePath);
      
      if (result.success) {
        const content = result.content ?? '';
        setCurrentFile({ path: filePath, content, aiTool });
        setState({
          content,
          originalContent: content,
          isModified: false,
          isLoading: false,
          isSaving: false,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error ?? '파일 로드 실패',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '파일 로드 실패',
      }));
    }
  }, []);

  const saveFile = useCallback(async (content: string) => {
    if (!currentFile) return;
    
    setState(prev => ({ ...prev, isSaving: true, error: null }));
    
    try {
      // Electron API를 사용하여 파일 저장
      const result = await window.electronAPI.writeFile(currentFile.path, content);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          originalContent: content,
          isModified: false,
          isSaving: false,
        }));
        console.log('File saved successfully!');
      } else {
        setState(prev => ({
          ...prev,
          isSaving: false,
          error: result.error ?? '파일 저장 실패',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : '파일 저장 실패',
      }));
    }
  }, [currentFile]);

  const setContent = useCallback((content: string) => {
    setState(prev => ({
      ...prev,
      content,
      isModified: content !== prev.originalContent,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      content: prev.originalContent,
      isModified: false,
      error: null,
    }));
  }, []);

  return {
    ...state,
    loadFile,
    saveFile,
    setContent,
    reset,
  };
};