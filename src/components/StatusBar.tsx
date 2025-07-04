import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Tooltip } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon, AddBox as AddBoxIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { TabsBar } from './TabsBar';
import { useAppStore } from '../stores/appStore';
import type { TabState } from '../types';

interface StatusBarProps {
  activeTab: TabState | undefined;
  onGoBack: () => void;
  onNewWindow: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ activeTab, onGoBack, onNewWindow }) => {
  const { t } = useTranslation();
  const { tabs, activeTabId, setActiveTab, addTab, closeTab } = useAppStore();
  const theme = useAppStore(state => state.uiState.theme);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar variant="dense" sx={{ minHeight: '48px', alignItems: 'stretch', px: '0 !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: '0 16px' }}>
          <Tooltip title="뒤로가기">
            <span>
              <IconButton edge="start" color="inherit" aria-label="back" onClick={onGoBack} disabled={!activeTab?.workspace}>
                <ArrowBackIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <TabsBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabChange={handleTabChange}
            onTabClose={closeTab}
            onAddTab={() => addTab(true)}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', p: '0 16px' }}>
          <Tooltip title="새 창">
            <IconButton edge="end" color="inherit" aria-label="new window" onClick={onNewWindow}>
              <AddBoxIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};