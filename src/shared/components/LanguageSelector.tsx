/**
 * Language Selector Component
 * 언어 선택 드롭다운
 */

import React from 'react';
import { MenuItem, Select, FormControl, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Language as LanguageIcon } from '@mui/icons-material';
import { supportedLanguages } from '../i18n/config';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event: any) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <FormControl size="small">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LanguageIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        <Select
          value={i18n.language}
          onChange={handleLanguageChange}
          sx={{ 
            minWidth: 100,
            '& .MuiSelect-select': {
              py: 0.5,
            }
          }}
        >
          {supportedLanguages.map(lang => (
            <MenuItem key={lang.code} value={lang.code}>
              {lang.nativeName}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </FormControl>
  );
};