import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  Psychology as GeminiIcon,
  SmartToy as ClaudeIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface AIToolSelectorProps {
  open: boolean;
  onSelect: (aiTool: 'gemini' | 'claude') => void;
  onCancel: () => void;
  recommendedTool?: 'gemini' | 'claude'; // 최근 사용한 AI 툴
}

export const AIToolSelector: React.FC<AIToolSelectorProps> = ({
  open,
  onSelect,
  onCancel,
  recommendedTool,
}) => {
  const { t } = useTranslation();
  const [selectedTool, setSelectedTool] = useState<'gemini' | 'claude'>(recommendedTool || 'gemini');

  const handleConfirm = () => {
    onSelect(selectedTool);
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          AI 도구 선택
          <Chip label="Beta" size="small" color="primary" variant="outlined" />
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          사용할 AI 도구를 선택해주세요. 선택한 도구가 자동으로 설치되고 실행됩니다.
        </Typography>

        <FormControl component="fieldset" fullWidth>
          <RadioGroup
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value as 'gemini' | 'claude')}
          >
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                value="gemini"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between', width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GeminiIcon color="primary" />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Google Gemini CLI
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Google의 최신 AI 모델 사용
                        </Typography>
                      </Box>
                    </Box>
                    {recommendedTool === 'gemini' && (
                      <Chip 
                        label={t('aiSelector.recommended')} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontSize: '0.6rem' }}
                      />
                    )}
                  </Box>
                }
                sx={{ 
                  border: recommendedTool === 'gemini' ? '2px solid' : '1px solid',
                  borderColor: selectedTool === 'gemini' 
                    ? 'primary.main' 
                    : recommendedTool === 'gemini' 
                      ? 'primary.light' 
                      : 'divider',
                  borderRadius: 1,
                  p: 1,
                  m: 0,
                  width: '100%',
                  backgroundColor: recommendedTool === 'gemini' ? 'primary.50' : 'transparent',
                }}
              />
            </Box>

            <Box>
              <FormControlLabel
                value="claude"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between', width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ClaudeIcon color="secondary" />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Anthropic Claude Code
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('aiSelector.claudeDescription')}
                        </Typography>
                      </Box>
                    </Box>
                    {recommendedTool === 'claude' && (
                      <Chip 
                        label={t('aiSelector.recommended')} 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                        sx={{ fontSize: '0.6rem' }}
                      />
                    )}
                  </Box>
                }
                sx={{ 
                  border: recommendedTool === 'claude' ? '2px solid' : '1px solid',
                  borderColor: selectedTool === 'claude' 
                    ? 'secondary.main' 
                    : recommendedTool === 'claude' 
                      ? 'secondary.light' 
                      : 'divider',
                  borderRadius: 1,
                  p: 1,
                  m: 0,
                  width: '100%',
                  backgroundColor: recommendedTool === 'claude' ? 'secondary.50' : 'transparent',
                }}
              />
            </Box>
          </RadioGroup>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          {t('common.cancel')}
        </Button>
        <Button onClick={handleConfirm} variant="contained">
          {t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};