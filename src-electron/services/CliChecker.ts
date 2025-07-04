/**
 * CLI Tools Checker
 * CLI 도구들의 설치 확인 및 설치 로직 (SRP 준수)
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class CliChecker {
  // Check if gemini-cli is installed globally
  async checkGeminiCliInstalled(): Promise<boolean> {
    try {
      // Try different methods to find gemini command
      const command = process.platform === 'win32' ? 'where gemini' : 'which gemini';
      await execAsync(command);
      
      // Also try to run version command
      await execAsync('gemini --version');
      return true;
    } catch (error) {
      console.log('gemini-cli not found:', error);
      return false;
    }
  }

  // Check if claude-code is installed globally
  async checkClaudeCodeInstalled(): Promise<boolean> {
    try {
      // Try different methods to find claude command
      const command = process.platform === 'win32' ? 'where claude' : 'which claude';
      await execAsync(command);
      
      // Also try to run version command
      await execAsync('claude --version');
      return true;
    } catch (error) {
      console.log('claude-code not found:', error);
      return false;
    }
  }

  // Install gemini-cli globally
  async installGeminiCli(): Promise<void> {
    console.log('Installing @google/gemini-cli globally...');
    
    try {
      const { stdout, stderr } = await execAsync('npm install -g @google/gemini-cli');
      console.log('Installation output:', stdout);
      
      if (stderr) {
        console.warn('Installation warnings:', stderr);
      }
      
      // Verify installation
      const isInstalled = await this.checkGeminiCliInstalled();
      if (!isInstalled) {
        throw new Error('Failed to verify gemini-cli installation');
      }
      
      console.log('gemini-cli installed successfully');
    } catch (error) {
      throw new Error(`Failed to install gemini-cli: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Install claude-code globally
  async installClaudeCode(): Promise<void> {
    console.log('Installing @anthropic-ai/claude-code globally...');
    
    try {
      const { stdout, stderr } = await execAsync('npm install -g @anthropic-ai/claude-code');
      console.log('Installation output:', stdout);
      
      if (stderr) {
        console.warn('Installation warnings:', stderr);
      }
      
      // Verify installation
      const isInstalled = await this.checkClaudeCodeInstalled();
      if (!isInstalled) {
        throw new Error('Failed to verify claude-code installation');
      }
      
      console.log('claude-code installed successfully');
    } catch (error) {
      throw new Error(`Failed to install claude-code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check CLI tool installation status
  async checkCliTool(aiTool: 'gemini' | 'claude'): Promise<boolean> {
    if (aiTool === 'gemini') {
      return await this.checkGeminiCliInstalled();
    } else {
      return await this.checkClaudeCodeInstalled();
    }
  }

  // Install CLI tool if not present
  async ensureCliToolInstalled(aiTool: 'gemini' | 'claude'): Promise<boolean> {
    const isInstalled = await this.checkCliTool(aiTool);
    
    if (!isInstalled) {
      try {
        if (aiTool === 'gemini') {
          await this.installGeminiCli();
        } else {
          await this.installClaudeCode();
        }
        return true;
      } catch (error) {
        console.error(`Failed to install ${aiTool}:`, error);
        return false;
      }
    }
    
    return true;
  }
}