import React from 'react';
import { Box, Tabs, Tab, IconButton, Tooltip } from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { TabState } from '../types';

interface TabLabelProps {
  tab: TabState;
  onClose: (event: React.MouseEvent, tabId: string) => void;
}

const TabLabel: React.FC<TabLabelProps> = ({ tab, onClose }) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <Box component="span" sx={{ flexGrow: 1, textTransform: 'none', textAlign: 'left', mr: 2 }}>
      {tab.title}
    </Box>
    <Tooltip title="Close Tab">
      <IconButton
        component="div"
        size="small"
        onClick={(e) => onClose(e, tab.id)}
        sx={{
          borderRadius: 1,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
          p: 0.2,
        }}
      >
        <CloseIcon sx={{ fontSize: '1rem' }} />
      </IconButton>
    </Tooltip>
  </Box>
);

interface TabsBarProps {
  tabs: TabState[];
  activeTabId: string | null;
  onTabChange: (event: React.SyntheticEvent, newValue: string) => void;
  onTabClose: (tabId: string) => void;
  onAddTab: () => void;
}

export const TabsBar: React.FC<TabsBarProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  onAddTab,
}) => {
  const { t } = useTranslation();

  const handleClose = (event: React.MouseEvent, tabId: string) => {
    event.stopPropagation();
    onTabClose(tabId);
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tabs
        value={activeTabId}
        onChange={onTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          '& .MuiTabs-indicator': {
            height: 2,
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            label={<TabLabel tab={tab} onClose={handleClose} />}
            sx={{
              minHeight: '48px',
              py: 0,
              px: 2,
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 'bold',
              },
            }}
          />
        ))}
      </Tabs>

      <Tooltip title={t('tabs.addNewTab')}>
        <IconButton
          onClick={onAddTab}
          size="small"
          sx={{ ml: 1, mr: 1, p: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};