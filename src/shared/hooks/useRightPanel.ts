/**
 * Right Panel Management Hook
 * Manages the visibility and state of the right sidebar panel
 */

import { useState, useCallback } from 'react';

export type PanelType = 'conversation' | 'logs' | null;

export interface RightPanelManager {
  isOpen: boolean;
  panelType: PanelType;
  openPanel: (type: PanelType) => void;
  closePanel: () => void;
  togglePanel: (type: PanelType) => void;
}

/**
 * Custom hook for managing right sidebar panel state
 */
export const useRightPanel = (): RightPanelManager => {
  const [isOpen, setIsOpen] = useState(false);
  const [panelType, setPanelType] = useState<PanelType>(null);

  const openPanel = useCallback((type: PanelType) => {
    setPanelType(type);
    setIsOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
    setPanelType(null);
  }, []);

  const togglePanel = useCallback((type: PanelType) => {
    if (isOpen && panelType === type) {
      closePanel();
    } else {
      openPanel(type);
    }
  }, [isOpen, panelType, openPanel, closePanel]);

  return {
    isOpen,
    panelType,
    openPanel,
    closePanel,
    togglePanel,
  };
};