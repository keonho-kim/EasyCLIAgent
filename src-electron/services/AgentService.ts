/**
 * Agent Service
 * AI 에이전트 서비스 메인 클래스 (리팩토링된 버전 - SRP 준수)
 */

import { CliChecker } from './CliChecker';
import { TerminalManager } from './TerminalManager';
import type { GeminiEvent } from '../types';

export class AgentService {
  private cliChecker: CliChecker;
  private terminalManager: TerminalManager;
  private currentAiTool: 'gemini' | 'claude' | null = null;
  private workspaceDir = '';

  constructor() {
    this.cliChecker = new CliChecker();
    this.terminalManager = new TerminalManager();
  }

  // Initialize AI tool with workspace
  async initialize(workspaceDir: string, aiTool: 'gemini' | 'claude'): Promise<boolean> {
    try {
      console.log(`Initializing ${aiTool} service with workspace:`, workspaceDir);
      
      this.workspaceDir = workspaceDir;
      this.currentAiTool = aiTool;

      // Check and install CLI tool if needed
      const isCliReady = await this.cliChecker.ensureCliToolInstalled(aiTool);
      if (!isCliReady) {
        console.error(`Failed to ensure ${aiTool} CLI tool is installed`);
        return false;
      }

      // Initialize terminal
      const isTerminalReady = await this.terminalManager.initializeTerminal(workspaceDir, aiTool);
      if (!isTerminalReady) {
        console.error(`Failed to initialize ${aiTool} terminal`);
        return false;
      }

      console.log(`${aiTool} service initialized successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to initialize ${aiTool} service:`, error);
      return false;
    }
  }

  // Send message to AI tool
  sendMessage(message: string): boolean {
    return this.terminalManager.sendMessage(message);
  }

  // Send keystroke to terminal
  sendKeystroke(keystroke: string): boolean {
    return this.terminalManager.sendKeystroke(keystroke);
  }

  // Register data event callback
  onData(callback: (data: string) => void): void {
    this.terminalManager.onData((event: GeminiEvent) => {
      callback(event.data);
    });
  }

  // Check if service is initialized
  isInitialized(): boolean {
    return this.terminalManager.isTerminalInitialized();
  }

  // Get current AI tool
  getCurrentAiTool(): 'gemini' | 'claude' | null {
    return this.currentAiTool;
  }

  // Get workspace directory
  getWorkspaceDir(): string {
    return this.workspaceDir;
  }

  // Clean up resources
  cleanup(): void {
    this.terminalManager.cleanup();
    this.currentAiTool = null;
    this.workspaceDir = '';
  }
}