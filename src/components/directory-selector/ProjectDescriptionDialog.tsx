import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import type { RecentFolder } from '../../types';

interface ProjectDescriptionDialogProps {
  open: boolean;
  folder?: RecentFolder;
  onClose: () => void;
  onSave: (folderId: string, description: string) => void;
}

export const ProjectDescriptionDialog: React.FC<ProjectDescriptionDialogProps> = ({
  open,
  folder,
  onClose,
  onSave,
}) => {
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (folder) {
      setDescription(folder.description || '');
    }
  }, [folder]);

  const handleSave = () => {
    if (folder) {
      onSave(folder.id, description);
    }
    onClose();
  };

  const handleClose = () => {
    setDescription('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>프로젝트 설명 편집</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {folder?.name} ({folder?.path})
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="이 프로젝트에 대한 설명을 입력하세요..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          취소
        </Button>
        <Button onClick={handleSave} variant="contained">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};