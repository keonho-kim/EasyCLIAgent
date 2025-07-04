/**
 * Terminal Manager
 * PTY 터미널 관리 로직 (SRP 준수)
 */

import * as pty from 'node-pty';
import * as os from 'os';
import type { GeminiEvent } from '../types';

export class TerminalManager {
  private terminalProcess: pty.IPty | null = null;
  private isInitialized = false;
  private eventCallbacks: Array<(event: GeminiEvent) => void> = [];

  // Initialize terminal with AI tool
  async initializeTerminal(workspaceDir: string, aiTool: 'gemini' | 'claude'): Promise<boolean> {
    try {
      if (this.terminalProcess) {
        this.terminalProcess.kill();
      }

      // Determine shell and command based on platform
      const shell = process.platform === 'win32' ? 'powershell.exe' : 
                   process.platform === 'darwin' ? '/bin/zsh' : '/bin/bash';
      
      // Create PTY process
      this.terminalProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: workspaceDir,
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor',
        }
      });

      // Set up data handlers
      this.terminalProcess.onData((data: string) => {
        this.handleTerminalData(data);
      });

      this.terminalProcess.onExit(({ exitCode, signal }) => {
        console.log(`Terminal process exited with code ${exitCode}, signal ${signal}`);
        this.isInitialized = false;
        this.terminalProcess = null;
      });

      // Change to workspace directory and start AI tool
      await this.executeCommand(`cd "${workspaceDir}"`);
      
      // Wait a bit for directory change
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Start the AI tool
      const command = aiTool === 'gemini' ? 'gemini' : 'claude';
      await this.executeCommand(command);

      this.isInitialized = true;
      console.log(`${aiTool} terminal initialized successfully in ${workspaceDir}`);
      
      return true;
    } catch (error) {
      console.error(`Failed to initialize ${aiTool} terminal:`, error);
      this.isInitialized = false;
      return false;
    }
  }

  // Execute command in terminal
  private async executeCommand(command: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.terminalProcess) {
        this.terminalProcess.write(command + '\r');
        setTimeout(resolve, 100);
      } else {
        resolve();
      }
    });
  }

  // Handle terminal data output
  private handleTerminalData(data: string): void {
    // Forward data to all registered callbacks
    const event: GeminiEvent = {
      type: 'output',
      data: data,
      timestamp: new Date()
    };
    
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in terminal data callback:', error);
      }
    });
  }

  // Send message to terminal
  sendMessage(message: string): boolean {
    if (!this.isInitialized || !this.terminalProcess) {
      console.warn('Cannot send message: Terminal not initialized');
      return false;
    }

    try {
      this.terminalProcess.write(message);
      return true;
    } catch (error) {
      console.error('Failed to send message to terminal:', error);
      return false;
    }
  }

  // Send keystroke directly to terminal
  sendKeystroke(keystroke: string): boolean {
    if (!this.isInitialized || !this.terminalProcess) {
      console.warn('Cannot send keystroke: Terminal not initialized');
      return false;
    }

    try {
      this.terminalProcess.write(keystroke);
      return true;
    } catch (error) {
      console.error('Failed to send keystroke to terminal:', error);
      return false;
    }
  }

  // Register data event callback
  onData(callback: (event: GeminiEvent) => void): void {
    this.eventCallbacks.push(callback);
  }

  // Clean up terminal
  cleanup(): void {
    if (this.terminalProcess) {
      try {
        this.terminalProcess.kill();
      } catch (error) {
        console.error('Error killing terminal process:', error);
      }
    }
    
    this.terminalProcess = null;
    this.isInitialized = false;
    this.eventCallbacks = [];
  }

  // Check if terminal is initialized
  isTerminalInitialized(): boolean {
    return this.isInitialized && this.terminalProcess !== null;
  }
}