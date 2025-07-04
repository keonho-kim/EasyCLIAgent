/**
 * ChatInput Buttons Component
 * 전송 버튼과 중단 버튼을 관리하는 컴포넌트 (SRP 준수)
 */

import React from 'react';
import {
  IconButton,
  InputAdornment,
  Tooltip,
  Box,
} from '@mui/material';
import {
  Send as SendIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ChatInputButtonsProps {
  disabled: boolean;
  message: string;
  onSend: () => void;
  onInterrupt: () => void;
}

export const ChatInputButtons: React.FC<ChatInputButtonsProps> = ({
  disabled,
  message,
  onSend,
  onInterrupt,
}) => {
  const { t } = useTranslation();

  return (
    <InputAdornment position="end">
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        {/* Stop button */}
        <Tooltip title={t('terminal.interrupt')}>
          <IconButton
            color="error"
            onClick={onInterrupt}
            disabled={disabled}
            size="small"
            sx={{ mr: 0.5 }}
          >
            <StopIcon />
          </IconButton>
        </Tooltip>

        {/* Send button */}
        <Tooltip title={t('terminal.send')}>
          <span>
            <IconButton
              color="primary"
              onClick={onSend}
              disabled={disabled || !message.trim()}
              size="small"
            >
              <SendIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </InputAdornment>
  );
};