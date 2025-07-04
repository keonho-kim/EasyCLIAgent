import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AppStore, AppConfig, DirectoryInfo, UIState, RecentFolder, TabState } from '../types';

const DEFAULT_UI_STATE: UIState = {
  sidebarOpen: true,
  terminalSize: {
    width: 80,
    height: 24,
  },
  theme: 'dark',
  fontSize: 14,
  logLevel: 'info',
};

const createNewTab = (): TabState => ({
  id: crypto.randomUUID(),
  title: 'New Tab',
  workspace: null,
  aiTool: null,
});

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        appConfig: null,
        tabs: [createNewTab()], // Start with one tab
        activeTabId: null,
        uiState: DEFAULT_UI_STATE,
        recentFolders: [],

        // 액션들
        setAppConfig: (config: AppConfig) => {
          set({ appConfig: config });
        },

        updateUIState: (updates: Partial<UIState>) => {
          set((state) => ({
            uiState: { ...state.uiState, ...updates },
          }));
        },

        toggleSidebar: () => {
          set((state) => ({
            uiState: {
              ...state.uiState,
              sidebarOpen: !state.uiState.sidebarOpen,
            },
          }));
        },

        setTheme: (theme: 'dark' | 'light') => {
          set((state) => ({
            uiState: { ...state.uiState, theme },
          }));
        },

        setFontSize: (fontSize: number) => {
          const clampedSize = Math.max(10, Math.min(24, fontSize));
          set((state) => ({
            uiState: { ...state.uiState, fontSize: clampedSize },
          }));
        },

        setLogLevel: (logLevel: UIState['logLevel']) => {
          set((state) => ({
            uiState: { ...state.uiState, logLevel },
          }));
        },
        
        // Tab Actions
        addTab: (andSelect = true) => {
          const newTab = createNewTab();
          set(state => ({ tabs: [...state.tabs, newTab] }));
          if (andSelect) {
            set({ activeTabId: newTab.id });
          }
          return newTab.id;
        },

        closeTab: (tabId: string) => {
          set(state => {
            const newTabs = state.tabs.filter(t => t.id !== tabId);
            let newActiveTabId = state.activeTabId;

            // If the active tab is closed, select another tab
            if (state.activeTabId === tabId) {
              if (newTabs.length > 0) {
                const closingTabIndex = state.tabs.findIndex(t => t.id === tabId);
                newActiveTabId = newTabs[Math.max(0, closingTabIndex - 1)].id;
              } else {
                newActiveTabId = null; // No tabs left
              }
            }
            
            // If no tabs are left, create a new one
            if (newTabs.length === 0) {
                const newTab = createNewTab();
                newTabs.push(newTab);
                newActiveTabId = newTab.id;
            }

            return { tabs: newTabs, activeTabId: newActiveTabId };
          });
        },

        setActiveTab: (tabId: string) => {
          set({ activeTabId: tabId });
        },

        updateTab: (tabId: string, updates: Partial<Omit<TabState, 'id'>>) => {
          set(state => ({
            tabs: state.tabs.map(tab => 
              tab.id === tabId ? { ...tab, ...updates } : tab
            )
          }));
        },
        
        goBack: (tabId: string) => {
          get().updateTab(tabId, { workspace: null, aiTool: null, title: 'New Tab' });
        },

        // Recent folders actions
        addRecentFolder: (directory: DirectoryInfo, description?: string, aiTool?: 'gemini' | 'claude') => {
          set((state) => {
            const existingIndex = state.recentFolders.findIndex(f => f.path === directory.path);
            const now = new Date();
            
            if (existingIndex !== -1) {
              // 기존 폴더 업데이트
              const updatedFolders = [...state.recentFolders];
              updatedFolders[existingIndex] = {
                ...updatedFolders[existingIndex],
                lastAccessed: now,
                accessCount: updatedFolders[existingIndex].accessCount + 1,
                ...(description && { description }),
                ...(aiTool && { aiTool }),
              };
              
              // 맨 앞으로 이동
              const [updated] = updatedFolders.splice(existingIndex, 1);
              updatedFolders.unshift(updated);
              
              return { recentFolders: updatedFolders };
            } else {
              // 새 폴더 추가
              const newFolder: RecentFolder = {
                id: crypto.randomUUID(),
                path: directory.path,
                name: directory.name,
                description,
                isBookmarked: false,
                lastAccessed: now,
                accessCount: 1,
                aiTool,
              };
              
              // 최대 20개까지만 유지
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
        name: process.env.NODE_ENV === 'development' ? 'app-store-dev' : 'app-store',
        partialize: (state) => ({
          uiState: state.uiState,
          recentFolders: state.recentFolders,
          tabs: state.tabs.map(t => ({ ...t, workspace: null, aiTool: null, title: 'New Tab' })), // Persist tabs but reset their state
          activeTabId: state.tabs.length > 0 ? state.tabs[0].id : null,
        }),
        onRehydrateStorage: () => (state) => {
            if (state) {
                // Ensure there's at least one tab on startup
                if (!state.tabs || state.tabs.length === 0) {
                    const newTab = createNewTab();
                    state.tabs = [newTab];
                    state.activeTabId = newTab.id;
                } else {
                    state.activeTabId = state.tabs[0].id;
                }
            }
        },
        version: 2, // Increment version for new structure
        migrate: (persistedState: any, version: number) => {
          if (version < 2) {
            // Migration logic from old structure to tab-based structure
            const newTab = createNewTab();
            if (persistedState.selectedDirectory) {
                newTab.workspace = persistedState.selectedDirectory;
                newTab.title = persistedState.selectedDirectory.name;
            }
            return {
              ...persistedState,
              tabs: [newTab],
              activeTabId: newTab.id,
              selectedDirectory: undefined, // remove old key
            };
          }
          return persistedState;
        },
      }
    ),
    {
      name: 'app-store',
    }
  )
);

// 선택자 함수들
export const selectAppConfig = (state: AppStore) => state.appConfig;
export const selectTabs = (state: AppStore) => state.tabs;
export const selectActiveTabId = (state: AppStore) => state.activeTabId;
export const selectActiveTab = (state: AppStore) => state.tabs.find(t => t.id === state.activeTabId);
export const selectUIState = (state: AppStore) => state.uiState;
export const selectTheme = (state: AppStore) => state.uiState.theme;
export const selectFontSize = (state: AppStore) => state.uiState.fontSize;
export const selectLogLevel = (state: AppStore) => state.uiState.logLevel;
export const selectSidebarOpen = (state: AppStore) => state.uiState.sidebarOpen;
export const selectRecentFolders = (state: AppStore) => state.recentFolders;
export const selectBookmarkedFolders = (state: AppStore) => state.recentFolders.filter(f => f.isBookmarked);

// Import utilities from separate files following SRP
export { isDevelopment, getPlatformInfo } from '../utils/appUtils';
export { getThemeColors } from '../utils/themeUtils';
export { getFontSizeInfo } from '../utils/fontUtils';