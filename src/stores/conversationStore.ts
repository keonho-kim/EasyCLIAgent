/**
 * Conversation Store
 * Manages conversation history with persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMemo } from 'react';
import type { ConversationEntry } from '../shared/types/conversation';

interface ConversationState {
  entries: ConversationEntry[];
  currentEntry: ConversationEntry | null;
  isCapturing: boolean;
  
  // Actions
  startCapture: (input: string, aiTool: 'gemini' | 'claude') => void;
  appendOutput: (output: string) => void;
  completeCapture: () => void;
  deleteEntry: (entryId: string) => void;
  clearHistory: () => void;
}

// 폴더별 conversation store를 생성하는 함수
export const createConversationStore = (workspacePath: string) => {
  // 폴더 경로를 안전한 키로 변환 (슬래시, 특수문자 제거)
  const sanitizedPath = workspacePath.replace(/[/\\:*?"<>|]/g, '_');
  const storageKey = `conversation-storage-${sanitizedPath}`;

  return create<ConversationState>()(
    persist(
      (set, get) => ({
        entries: [],
        currentEntry: null,
        isCapturing: false,

        startCapture: (input: string, aiTool: 'gemini' | 'claude') => {
          const newEntry: ConversationEntry = {
            id: `conversation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            input: input.trim(),
            output: '',
            timestamp: new Date(),
            aiTool,
            isCompleted: false,
          };

          set({
            currentEntry: newEntry,
            isCapturing: true,
          });
        },

        appendOutput: (output: string) => {
          const { currentEntry } = get();
          if (currentEntry) {
            set({
              currentEntry: {
                ...currentEntry,
                output: currentEntry.output + output,
              },
            });
          }
        },

        completeCapture: () => {
          const { currentEntry, entries } = get();
          if (currentEntry) {
            const completedEntry = {
              ...currentEntry,
              isCompleted: true,
            };

            set({
              entries: [completedEntry, ...entries],
              currentEntry: null,
              isCapturing: false,
            });
          }
        },

        deleteEntry: (entryId: string) => {
          set((state) => ({
            entries: state.entries.filter((entry) => entry.id !== entryId),
          }));
        },

        clearHistory: () => {
          set({
            entries: [],
            currentEntry: null,
            isCapturing: false,
          });
        },
      }),
      {
        name: storageKey,
        partialize: (state) => ({
          entries: state.entries,
          // currentEntry와 isCapturing은 persist하지 않음 (세션별 상태)
        }),
      }
    )
  );
};

// 폴더별 store 인스턴스를 캐시하는 Map
const conversationStoreCache = new Map<string, ReturnType<typeof createConversationStore>>();

// 기본 빈 store (workspacePath가 없을 때 사용)
const defaultStore = create<ConversationState>()((set, get) => ({
  entries: [],
  currentEntry: null,
  isCapturing: false,
  startCapture: () => {},
  appendOutput: () => {},
  completeCapture: () => {},
  deleteEntry: () => {},
  clearHistory: () => {},
}));

// 안전한 store 가져오기 함수 (hooks 외부에서 실행)
const getConversationStore = (workspacePath?: string) => {
  if (!workspacePath) {
    return defaultStore;
  }

  // 캐시에서 기존 store를 찾거나 새로 생성
  if (!conversationStoreCache.has(workspacePath)) {
    conversationStoreCache.set(workspacePath, createConversationStore(workspacePath));
  }

  return conversationStoreCache.get(workspacePath)!;
};

// 폴더별 conversation store를 가져오는 hook
export const useConversationStore = (workspacePath?: string) => {
  const store = useMemo(() => {
    return getConversationStore(workspacePath);
  }, [workspacePath]);
  
  return store();
};