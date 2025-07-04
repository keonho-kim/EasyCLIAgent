import React from 'react';
import {
  Box,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Chip,
  Typography,
} from '@mui/material';
import {
  FolderOpen as FolderIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { RecentFolder } from '../../types';

interface RecentFolderItemProps {
  folder: RecentFolder;
  theme: 'dark' | 'light';
  showBookmarkToggle?: boolean;
  onSelect: (path: string, name: string) => void;
  onEdit: (folder: RecentFolder) => void;
  onToggleBookmark: (id: string) => void;
  onRemove: (id: string) => void;
}

const formatLastAccessed = (date: Date, t: any): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return t('common.daysAgo', { count: days });
  if (hours > 0) return t('common.hoursAgo', { count: hours });
  return t('common.justNow');
};

export const RecentFolderItem: React.FC<RecentFolderItemProps> = ({
  folder,
  theme,
  showBookmarkToggle = true,
  onSelect,
  onEdit,
  onToggleBookmark,
  onRemove,
}) => {
  const { t } = useTranslation();
  return (
    <ListItem disablePadding>
      <ListItemButton 
        onClick={() => {
          console.log(`[RecentFolderItem] Clicked! Path: ${folder.path}, Name: ${folder.name}`);
          onSelect(folder.path, folder.name);
        }}
        sx={{
          borderRadius: 1,
          mb: 0.5,
          '&:hover': {
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <ListItemIcon>
          <FolderIcon color="primary" />
        </ListItemIcon>
        <Box sx={{ flex: 1, ml: 2, mr: 6 }}>
          {/* Primary content */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" noWrap sx={{ flex: 1 }}>
              {folder.name}
            </Typography>
            {folder.isBookmarked && (
              <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
            )}
            <Chip
              icon={<TimeIcon sx={{ fontSize: 12 }} />}
              label={formatLastAccessed(folder.lastAccessed, t)}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          </Box>
          
          {/* Secondary content */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {folder.path}
            </Typography>
            {folder.description && (
              <Typography variant="caption" color="primary.main" sx={{ fontStyle: 'italic' }}>
                {folder.description}
              </Typography>
            )}
          </Box>
        </Box>
        <ListItemSecondaryAction>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={t('directoryBrowser.editDescription')}>
              <IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                onEdit(folder);
              }}>
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            
            {showBookmarkToggle && (
              <Tooltip title={folder.isBookmarked ? t('directoryBrowser.removeFromBookmark') : t('directoryBrowser.addToBookmark')}>
                <IconButton size="small" onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(folder.id);
                }}>
                  {folder.isBookmarked ? (
                    <BookmarkIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                  ) : (
                    <BookmarkBorderIcon sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title={t('directoryBrowser.removeFromRecent')}>
              <IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                onRemove(folder.id);
              }}>
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </ListItemSecondaryAction>
      </ListItemButton>
    </ListItem>
  );
};