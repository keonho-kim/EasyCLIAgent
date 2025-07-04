import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { RecentFolder, DirectoryInfo } from '../types';

interface RecentFoldersStore {
  recentFolders: RecentFolder[];
  addRecentFolder: (directory: DirectoryInfo, description?: string) => void;
  updateRecentFolder: (id: string, updates: Partial<RecentFolder>) => void;
  removeRecentFolder: (id: string) => void;
  toggleBookmark: (id: string) => void;
  clearRecentFolders: () => void;
}

export const useRecentFoldersStore = create<RecentFoldersStore>()(
  devtools(
    persist(
      (set) => ({
        recentFolders: [],

        addRecentFolder: (directory: DirectoryInfo, description?: string) => {
          set((state) => {
            const existingIndex = state.recentFolders.findIndex(f => f.path === directory.path);
            const now = new Date();
            
            if (existingIndex !== -1) {
              // Update existing folder
              const updatedFolders = [...state.recentFolders];
              updatedFolders[existingIndex] = {
                ...updatedFolders[existingIndex],
                lastAccessed: now,
                accessCount: updatedFolders[existingIndex].accessCount + 1,
                ...(description && { description }),
              };
              
              // Move to front
              const [updated] = updatedFolders.splice(existingIndex, 1);
              updatedFolders.unshift(updated);
              
              return { recentFolders: updatedFolders };
            } else {
              // Add new folder
              const newFolder: RecentFolder = {
                id: crypto.randomUUID(),
                path: directory.path,
                name: directory.name,
                description,
                isBookmarked: false,
                lastAccessed: now,
                accessCount: 1,
              };
              
              // Keep max 20 folders
              const updatedFolders = [newFolder, ...state.recentFolders].slice(0, 20);
              return { recentFolders: updatedFolders };
            }
          });
        },

        updateRecentFolder: (id: string, updates: Partial<RecentFolder>) => {
          set((state) => ({
            recentFolders: state.recentFolders.map(folder =>
              folder.id === id ? { ...folder, ...updates } : folder
            ),
          }));
        },

        removeRecentFolder: (id: string) => {
          set((state) => ({
            recentFolders: state.recentFolders.filter(folder => folder.id !== id),
          }));
        },

        toggleBookmark: (id: string) => {
          set((state) => ({
            recentFolders: state.recentFolders.map(folder =>
              folder.id === id ? { ...folder, isBookmarked: !folder.isBookmarked } : folder
            ),
          }));
        },

        clearRecentFolders: () => {
          set({ recentFolders: [] });
        },
      }),
      {
        name: process.env.NODE_ENV === 'development' ? 'recent-folders-dev' : 'recent-folders',
        version: 1,
        migrate: (persistedState: any, version: number) => {
          if (version === 0) {
            return {
              ...persistedState,
              recentFolders: persistedState.recentFolders || [],
            };
          }
          return persistedState;
        },
      }
    ),
    {
      name: 'recent-folders-store',
    }
  )
);

// Selectors
export const selectRecentFolders = (state: RecentFoldersStore) => state.recentFolders;
export const selectBookmarkedFolders = (state: RecentFoldersStore) => 
  state.recentFolders.filter(f => f.isBookmarked);