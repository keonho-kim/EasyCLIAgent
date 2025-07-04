/**
 * Agent IPC Handlers
 * AI 에이전트 관련 IPC 핸들러들 (SRP 준수)
 */

import { ipcMain, dialog } from 'electron';
import type { AgentService } from '../services/AgentService';
import type { ToolConfirmationRequest } from '../types/index';

export function setupAgentHandlers(agentService: AgentService) {
  // AI 도구 초기화
  ipcMain.handle('initialize-ai-tool', async (event, workspaceDir: string, aiTool: 'gemini' | 'claude') => {
    try {
      console.log(`Initializing ${aiTool} with workspace:`, workspaceDir);
      
      const success = await agentService.initialize(workspaceDir, aiTool);
      
      if (success) {
        // 터미널 데이터 이벤트 리스너 설정
        agentService.onData((data: string) => {
          event.sender.send('terminal:data', data);
        });
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: `${aiTool} 초기화에 실패했습니다. ${aiTool === 'gemini' ? 'gemini-cli' : 'claude-code'}가 설치되어 있는지 확인해주세요.`
        };
      }
    } catch (error) {
      console.error(`${aiTool} initialization error:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : `${aiTool} 초기화 실패`
      };
    }
  });

  // 메시지 전송
  ipcMain.handle('send-message', async (_, message: string) => {
    try {
      const success = agentService.sendMessage(message);
      return { success };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '메시지 전송 실패'
      };
    }
  });

  // 터미널 키스트로크 전송
  ipcMain.handle('send-terminal-command', async (_, keystroke: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const success = agentService.sendKeystroke(keystroke);
      return { success };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '터미널 키스트로크 전송 실패'
      };
    }
  });

  // 터미널 인터럽트 (ESC)
  ipcMain.handle('interrupt-terminal', async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const success = agentService.sendKeystroke('\x1b'); // ESC key
      return { success };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '터미널 인터럽트 실패'
      };
    }
  });

  // 도구 실행 확인
  ipcMain.handle('confirm-tool-execution', async (event, request: ToolConfirmationRequest): Promise<boolean> => {
    try {
      const result = await dialog.showMessageBox({
        type: 'question',
        buttons: ['실행', '취소'],
        defaultId: 0,
        message: '도구 실행 확인',
        detail: `다음 도구를 실행하시겠습니까?\n\n${request.toolName}\n\n설명: ${request.description}`,
        cancelId: 1,
      });
      
      return result.response === 0;
    } catch (error) {
      console.error('Tool confirmation error:', error);
      return false;
    }
  });
}