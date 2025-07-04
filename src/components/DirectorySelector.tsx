import React from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Container,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Bookmark as BookmarkIcon,
  History as HistoryIcon,
  FolderOpen,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { RecentFolderList } from './directory-selector/RecentFolderList';
import { ProjectDescriptionDialog } from './directory-selector/ProjectDescriptionDialog';
import { useDirectorySelector } from './directory-selector/useDirectorySelector';
import { LanguageSelector } from '../shared/components/LanguageSelector';

interface DirectorySelectorProps {
  onDirectorySelect: (tabId: string, path: string, name: string) => void;
  activeTabId: string;
}

export const DirectorySelector: React.FC<DirectorySelectorProps> = ({ 
  onDirectorySelect,
  activeTabId
}) => {
  const { t } = useTranslation();
  const {
    isSelecting,
    error,
    tabValue,
    editDialog,
    bookmarkedFolders,
    recentNonBookmarked,
    theme,
    setTabValue,
    handleSelectDirectory,
    handleEditDescription,
    handleSaveDescription,
    handleCloseDialog,
    toggleBookmark,
    removeRecentFolder,
  } = useDirectorySelector();

  const hasRecentFolders = bookmarkedFolders.length > 0 || recentNonBookmarked.length > 0;

  // "폴더 찾아보기" 버튼을 클릭했을 때의 핸들러
  const handleBrowse = () => {
    handleSelectDirectory((path, name) => onDirectorySelect(activeTabId, path, name));
  };

  // "최근 폴더" 목록에서 항목을 클릭했을 때의 핸들러
  const handleRecentFolderSelect = (path: string, name: string) => {
    onDirectorySelect(activeTabId, path, name);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1 }}>
        <LanguageSelector />
      </Box>
      
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <ComputerIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          EasyCLIAgent
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('header.selectDirectory')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={3}
        sx={{
          background: theme === 'dark' ? '#2d2d2d' : '#ffffff',
          border: '1px solid',
          borderColor: theme === 'dark' ? '#444' : '#ddd',
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={isSelecting ? <CircularProgress size={20} /> : <FolderOpen />}
            onClick={handleBrowse}
            disabled={isSelecting}
            sx={{
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              borderRadius: 2,
              textTransform: 'none',
              background: 'linear-gradient(45deg, #4285f4 30%, #34a853 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #3367d6 30%, #2d7d32 90%)',
              },
            }}
          >
            {isSelecting ? '...' : t('directory.browseButton')}
          </Button>
        </Box>

        {hasRecentFolders && (
          <>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Tab 
                icon={<BookmarkIcon />} 
                label={`${t('directoryBrowser.bookmarked')} (${bookmarkedFolders.length})`} 
                iconPosition="start"
                sx={{ textTransform: 'none' }}
              />
              <Tab 
                icon={<HistoryIcon />} 
                label={`${t('directoryBrowser.recent')} (${recentNonBookmarked.length})`} 
                iconPosition="start"
                sx={{ textTransform: 'none' }}
              />
            </Tabs>

            <Box sx={{ p: 2, minHeight: 200, maxHeight: 400, overflow: 'auto' }}>
              {tabValue === 0 && (
                <RecentFolderList
                  folders={bookmarkedFolders}
                  theme={theme}
                  emptyIcon={BookmarkIcon}
                  emptyTitle={t('directoryBrowser.noBookmarkedFolders')}
                  emptySubtitle=""
                  showBookmarkToggle={false}
                  onSelect={handleRecentFolderSelect}
                  onEditDescription={handleEditDescription}
                  onToggleBookmark={toggleBookmark}
                  onRemoveFolder={removeRecentFolder}
                />
              )}

              {tabValue === 1 && (
                <RecentFolderList
                  folders={recentNonBookmarked}
                  theme={theme}
                  emptyIcon={HistoryIcon}
                  emptyTitle={t('directoryBrowser.noRecentFolders')}
                  emptySubtitle=""
                  showBookmarkToggle={true}
                  onSelect={handleRecentFolderSelect}
                  onEditDescription={handleEditDescription}
                  onToggleBookmark={toggleBookmark}
                  onRemoveFolder={removeRecentFolder}
                />
              )}
            </Box>
          </>
        )}
      </Paper>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Powered by Google Gemini • Built with Electron & React
        </Typography>
      </Box>

      <ProjectDescriptionDialog
        open={editDialog.open}
        folder={editDialog.folder}
        onClose={handleCloseDialog}
        onSave={handleSaveDescription}
      />
    </Container>
  );
};