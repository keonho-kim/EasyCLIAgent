import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { UIState } from '../types';

interface UIStore {
  uiState: UIState;
  updateUIState: (updates: Partial<UIState>) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setFontSize: (size: number) => void;
  setLogLevel: (level: UIState['logLevel']) => void;
}

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

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        uiState: DEFAULT_UI_STATE,

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
      }),
      {
        name: process.env.NODE_ENV === 'development' ? 'ui-store-dev' : 'ui-store',
        version: 1,
        migrate: (persistedState: any, version: number) => {
          if (version === 0) {
            return {
              ...persistedState,
              uiState: { ...DEFAULT_UI_STATE, ...persistedState.uiState },
            };
          }
          return persistedState;
        },
      }
    ),
    {
      name: 'ui-store',
    }
  )
);

// Selectors
export const selectUIState = (state: UIStore) => state.uiState;
export const selectTheme = (state: UIStore) => state.uiState.theme;
export const selectFontSize = (state: UIStore) => state.uiState.fontSize;
export const selectLogLevel = (state: UIStore) => state.uiState.logLevel;
export const selectSidebarOpen = (state: UIStore) => state.uiState.sidebarOpen;