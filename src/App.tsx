import React, { useState, useEffect, useCallback } from 'react';
import { Box, Snackbar, Alert, Typography } from '@mui/material';
import { DirectorySelector } from './components/DirectorySelector';
import { SimpleTerminal } from './features/terminal';
import { ChatInput } from './features/chat-input';
import { AIToolSelector } from './components/AIToolSelector';
import { InstructionEditorModal } from './features/instruction-editor';
import { useAppStore } from './stores/appStore';
import { useFocusManager } from './shared/hooks/useFocusManager';
import { useAIToolManager } from './shared/hooks/useAIToolManager';
import { useTranslation } from 'react-i18next';
import { StatusBar } from './components/StatusBar';
import './shared/i18n/config';

function App() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [markdownEditorOpen, setMarkdownEditorOpen] = useState(false);
  
  const { tabs, activeTabId, goBack, updateTab, addRecentFolder, recentFolders, setActiveTab } = useAppStore();
  const activeTab = tabs.find(t => t.id === activeTabId);

  const focusManager = useFocusManager('terminal');
  const aiToolManager = useAIToolManager();

  useEffect(() => {
    // Set the first tab as active on initial load if not already set
    if (!activeTabId && tabs.length > 0) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTabId, setActiveTab]);

  const handleDirectorySelect = useCallback((tabId: string, path: string, name: string) => {
    console.log(`[App.tsx] handleDirectorySelect received: tabId=${tabId}, path=${path}, name=${name}`);
    try {
      aiToolManager.showSelector({ path, name });
      // Store the tabId that initiated the selection
      // This could be a state in a manager or context if it gets complex
      (window as any)._currentTabForSelection = tabId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errors.directorySelect');
      setError(errorMessage);
    }
  }, [aiToolManager, t]);

  const handleAIToolSelect = async (aiTool: 'gemini' | 'claude') => {
    const tabId = (window as any)._currentTabForSelection;
    if (!aiToolManager.pendingDirectory || !tabId) return;
    
    console.log(`[App.tsx] handleAIToolSelect will use path: ${aiToolManager.pendingDirectory.path}`);
    try {
      updateTab(tabId, { 
        workspace: aiToolManager.pendingDirectory, 
        aiTool: aiTool,
        title: aiToolManager.pendingDirectory.name
      });
      addRecentFolder(aiToolManager.pendingDirectory, undefined, aiTool);
      
      const configResult = await window.electronAPI.createAIConfigFile(
        aiToolManager.pendingDirectory.path, 
        aiTool
      );
      
      if (!configResult.success) {
        console.warn('AI 설정 파일 생성 실패:', configResult.error);
      }

      // const result = await aiToolManager.initializeTool(aiTool, aiToolManager.pendingDirectory);
      
      // if (!result.success) {
      //   setError(result.error || t('errors.aiInit'));
      // }
      
      aiToolManager.hideSelector();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errors.aiInit');
      setError(errorMessage);
    }
  };

  const handleAISelectorCancel = () => {
    aiToolManager.hideSelector();
  };

  const handleSendCommand = async (command: string) => {
    if (!activeTab?.workspace) return;
    try {
      console.log('Sending command to terminal:', command);
      const result = await window.electronAPI.sendMessage(command);
      if (!result.success) {
        setError(result.error || t('errors.messageSend'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errors.messageSend');
      setError(errorMessage);
    }
  };

  // 터미널 출력 캡처 (대화 패널 없이 로깅용)
  const handleTerminalData = (data: string) => {
    // 간단한 로깅만 (나중에 필요시 확장 가능)
    console.log('[Terminal Output]:', data);
  };

  const handleOpenMarkdownEditor = () => setMarkdownEditorOpen(true);
  const handleCloseMarkdownEditor = () => setMarkdownEditorOpen(false);

  const handleGoBack = () => {
    if (activeTabId) {
      goBack(activeTabId);
    }
  };

  const handleNewWindow = () => {
    window.electronAPI.newWindow();
  };

  const renderContent = () => {
    if (!activeTab) {
      return (
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>새 탭을 열어주세요.</Typography>
        </Box>
      );
    }

    if (!activeTab.workspace) {
      return <DirectorySelector key={activeTab.id} activeTabId={activeTab.id} onDirectorySelect={(tabId, path, name) => handleDirectorySelect(tabId, path, name)} />;
    }

    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box 
          sx={{ flex: 1, overflow: 'hidden', ...focusManager.getTerminalStyles() }}
          onClick={focusManager.setTerminalFocus}
        >
          <SimpleTerminal 
            key={activeTab.id} // Ensure terminal remounts for new tab
            workspaceDir={activeTab.workspace.path}
            aiTool={activeTab.aiTool || 'gemini'}
            onFocus={focusManager.setTerminalFocus}
            onTerminalData={handleTerminalData}
            onInstructionEdit={handleOpenMarkdownEditor}
          />
        </Box>
        <Box 
          sx={{ borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper', ...focusManager.getChatStyles() }}
          onClick={focusManager.setChatFocus}
        >
          <ChatInput 
            onSendMessage={handleSendCommand}
            workspaceDir={activeTab.workspace.path}
            aiTool={activeTab.aiTool || 'gemini'}
            placeholder={t('terminal.placeholder')}
            onFocus={focusManager.setChatFocus}
            onBlur={focusManager.setTerminalFocus}
          />
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <StatusBar activeTab={activeTab} onGoBack={handleGoBack} onNewWindow={handleNewWindow} />
      {renderContent()}
      
      {/* Modals and Side Panels */}
      <AIToolSelector
        open={aiToolManager.showAISelector}
        onSelect={handleAIToolSelect}
        onCancel={handleAISelectorCancel}
        recommendedTool={aiToolManager.pendingDirectory ? recentFolders.find(f => f.path === aiToolManager.pendingDirectory?.path)?.aiTool : undefined}
      />

      
      {activeTab?.workspace && (
        <InstructionEditorModal
          open={markdownEditorOpen}
          workspacePath={activeTab.workspace.path}
          aiTool={activeTab.aiTool || 'gemini'}
          onClose={handleCloseMarkdownEditor}
        />
      )}
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
