/**
 * Autocomplete Dropdown Component
 * 자동완성 드롭다운 UI
 */

import React from 'react';
import { Box, List, ListItem, Typography, Chip } from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Terminal as CommandIcon,
} from '@mui/icons-material';
import type { CompletionItem } from '../model/types';

interface AutocompleteDropdownProps {
  items: CompletionItem[];
  selectedIndex: number;
  onSelect: (item: CompletionItem) => void;
  onHover: (index: number) => void;
}

export const AutocompleteDropdown: React.FC<AutocompleteDropdownProps> = ({
  items,
  selectedIndex,
  onSelect,
  onHover,
}) => {
  const getIcon = (kind: CompletionItem['kind']) => {
    switch (kind) {
      case 'folder':
        return <FolderIcon sx={{ fontSize: 16, color: 'warning.main' }} />;
      case 'file':
        return <FileIcon sx={{ fontSize: 16, color: 'info.main' }} />;
      case 'command':
        return <CommandIcon sx={{ fontSize: 16, color: 'success.main' }} />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        boxShadow: 2,
        maxHeight: 200,
        overflow: 'auto',
      }}
    >
      <List dense sx={{ py: 0 }}>
        {items.map((item, index) => (
          <ListItem
            key={item.id}
            sx={{
              cursor: 'pointer',
              backgroundColor: index === selectedIndex ? 'action.selected' : 'transparent',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              py: 0.5,
              px: 1,
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(item);
            }}
            onMouseDown={(e) => {
              // 마우스 다운 이벤트도 차단하여 input의 blur를 방지
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseEnter={() => onHover(index)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              {getIcon(item.kind)}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: index === selectedIndex ? 'bold' : 'normal',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </Typography>
                {item.detail && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                    }}
                  >
                    {item.detail}
                  </Typography>
                )}
              </Box>
              <Chip
                label={item.kind}
                size="small"
                variant="outlined"
                sx={{ 
                  height: 16,
                  fontSize: '0.6rem',
                  '& .MuiChip-label': { px: 0.5 }
                }}
              />
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};