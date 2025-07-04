/**
 * AI Tool Management Hook
 * Follows SRP - Single responsibility for managing AI tool selection and initialization
 */

import { useState, useCallback, useEffect } from 'react';
import { getShortPath } from '../lib/pathUtils';

export type AITool = 'gemini' | 'claude';

export interface PendingDirectory {
  path: string;
  name: string;
}

export interface AIToolManager {
  selectedAITool: AITool | null;
  showAISelector: boolean;
  pendingDirectory: PendingDirectory | null;
  setSelectedAITool: (tool: AITool) => void;
  showSelector: (directory: PendingDirectory) => void;
  hideSelector: () => void;
  // initializeTool: (tool: AITool, directory: PendingDirectory) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Custom hook for managing AI tool selection and initialization
 * Handles the workflow: directory selection → AI tool selection → initialization
 */
export const useAIToolManager = (): AIToolManager => {
  const [selectedAITool, setSelectedAITool] = useState<AITool | null>(null);
  const [showAISelector, setShowAISelector] = useState(false);
  const [pendingDirectory, setPendingDirectory] = useState<PendingDirectory | null>(null);

  // Update window title when tool or directory changes
  useEffect(() => {
    if (selectedAITool && pendingDirectory) {
      const toolName = selectedAITool === 'gemini' ? 'Gemini' : 'Claude';
      const shortPath = getShortPath(pendingDirectory.path);
      document.title = `${toolName}@${shortPath}`;
    } else {
      document.title = 'EasyCLIAgent';
    }
  }, [selectedAITool, pendingDirectory]);

  const showSelector = useCallback((directory: PendingDirectory) => {
    setPendingDirectory(directory);
    setShowAISelector(true);
  }, []);

  const hideSelector = useCallback(() => {
    setShowAISelector(false);
    setPendingDirectory(null);
  }, []);

  // initializeTool: (tool: AITool, directory: PendingDirectory) => Promise<{ success: boolean; error?: string }>;

  return {
    selectedAITool,
    showAISelector,
    pendingDirectory,
    setSelectedAITool,
    showSelector,
    hideSelector,
    // initializeTool,
  };
};