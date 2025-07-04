import React from 'react';
import { Box, List, Typography } from '@mui/material';
import { Star as StarIcon, History as HistoryIcon } from '@mui/icons-material';
import { RecentFolderItem } from './RecentFolderItem';
import type { RecentFolder } from '../../types';

interface RecentFolderListProps {
  folders: RecentFolder[];
  theme: 'dark' | 'light';
  emptyIcon: typeof StarIcon;
  emptyTitle: string;
  emptySubtitle: string;
  showBookmarkToggle?: boolean;
  onSelect: (path: string, name: string) => void;
  onEditDescription: (folder: RecentFolder) => void;
  onToggleBookmark: (id: string) => void;
  onRemoveFolder: (id: string) => void;
}

export const RecentFolderList: React.FC<RecentFolderListProps> = ({
  folders,
  theme,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptySubtitle,
  showBookmarkToggle = true,
  onSelect,
  onEditDescription,
  onToggleBookmark,
  onRemoveFolder,
}) => {
  if (folders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <EmptyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {emptyTitle}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {emptySubtitle}
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ py: 0 }}>
      {folders.map((folder) => (
        <RecentFolderItem
          key={folder.id}
          folder={folder}
          theme={theme}
          showBookmarkToggle={showBookmarkToggle}
          onSelect={onSelect}
          onEdit={onEditDescription}
          onToggleBookmark={onToggleBookmark}
          onRemove={onRemoveFolder}
        />
      ))}
    </List>
  );
};