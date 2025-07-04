/**
 * Conversation Tracker Hook
 * Tracks input-output pairs for conversation history
 */

import { useState, useCallback, useRef } from 'react';
import { ConversationEntry } from '../types/conversation';

export interface ConversationTracker {
  entries: ConversationEntry[];
  startCapture: (input: string, aiTool: 'gemini' | 'claude') => void;
  appendOutput: (output: string) => void;
  completeCapture: () => void;
  clearHistory: () => void;
  deleteEntry: (entryId: string) => void;
  isCapturing: boolean;
}

/**
 * Custom hook for tracking conversation input-output pairs
 * Manages real-time streaming and memory efficiently
 */
export const useConversationTracker = (maxEntries: number = 100): ConversationTracker => {
  const [entries, setEntries] = useState<ConversationEntry[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const currentEntryRef = useRef<ConversationEntry | null>(null);
  const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Start capturing a new conversation entry
  const startCapture = useCallback((input: string, aiTool: 'gemini' | 'claude') => {
    // Complete any previous capture
    if (currentEntryRef.current && !currentEntryRef.current.isCompleted) {
      completeCapture();
    }

    const newEntry: ConversationEntry = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      input: input.trim(),
      output: '',
      isCompleted: false,
      aiTool,
    };

    currentEntryRef.current = newEntry;
    setIsCapturing(true);

    // Auto-complete capture after 30 seconds if no activity
    captureTimeoutRef.current = setTimeout(() => {
      completeCapture();
    }, 30000);
  }, []);

  // Append output to current conversation entry
  const appendOutput = useCallback((output: string) => {
    if (!currentEntryRef.current || currentEntryRef.current.isCompleted) {
      return;
    }

    currentEntryRef.current.output += output;

    // Reset timeout on new output
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = setTimeout(() => {
        completeCapture();
      }, 5000); // Complete after 5 seconds of no output
    }
  }, []);

  // Complete current capture and add to entries
  const completeCapture = useCallback(() => {
    if (!currentEntryRef.current || currentEntryRef.current.isCompleted) {
      return;
    }

    currentEntryRef.current.isCompleted = true;
    const completedEntry = { ...currentEntryRef.current };

    setEntries(prev => {
      const newEntries = [...prev, completedEntry];
      // Memory management: keep only recent entries
      if (newEntries.length > maxEntries) {
        return newEntries.slice(-maxEntries);
      }
      return newEntries;
    });

    currentEntryRef.current = null;
    setIsCapturing(false);

    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
    }
  }, [maxEntries]);

  // Clear all conversation history
  const clearHistory = useCallback(() => {
    setEntries([]);
    currentEntryRef.current = null;
    setIsCapturing(false);
    
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
    }
  }, []);

  // Delete individual conversation entry
  const deleteEntry = useCallback((entryId: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== entryId));
  }, []);

  return {
    entries,
    startCapture,
    appendOutput,
    completeCapture,
    clearHistory,
    deleteEntry,
    isCapturing,
  };
};