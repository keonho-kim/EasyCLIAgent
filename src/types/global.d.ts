import { ElectronAPI } from '../shared/types/electronAPI';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};