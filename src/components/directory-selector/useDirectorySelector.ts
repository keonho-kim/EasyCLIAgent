import { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import type { RecentFolder } from '../../types';

export const useDirectorySelector = () => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [editDialog, setEditDialog] = useState<{ open: boolean; folder?: RecentFolder }>({ 
    open: false 
  });

  const { 
    recentFolders, 
    addRecentFolder, 
    updateRecentFolder, 
    removeRecentFolder, 
    toggleBookmark,
    uiState 
  } = useAppStore();

  const bookmarkedFolders = recentFolders.filter(f => f.isBookmarked);
  const recentNonBookmarked = recentFolders.filter(f => !f.isBookmarked).slice(0, 10);

  const handleSelectDirectory = async (onDirectorySelect: (path: string, name: string) => void) => {
    setIsSelecting(true);
    setError(null);

    try {
      const result = await window.electronAPI.selectDirectory();
      
      if (result.success && result.path && result.name) {
        const directoryInfo = { path: result.path, name: result.name };
        addRecentFolder(directoryInfo);
        onDirectorySelect(result.path, result.name);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '디렉토리 선택 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsSelecting(false);
    }
  };

  const handleEditDescription = (folder: RecentFolder) => {
    setEditDialog({ open: true, folder });
  };

  const handleSaveDescription = (folderId: string, description: string) => {
    updateRecentFolder(folderId, { description });
    setEditDialog({ open: false });
  };

  const handleCloseDialog = () => {
    setEditDialog({ open: false });
  };

  return {
    // State
    isSelecting,
    error,
    tabValue,
    editDialog,
    bookmarkedFolders,
    recentNonBookmarked,
    theme: uiState.theme,

    // Actions
    setTabValue,
    handleSelectDirectory,
    handleEditDescription,
    handleSaveDescription,
    handleCloseDialog,
    toggleBookmark,
    removeRecentFolder,
  };
};