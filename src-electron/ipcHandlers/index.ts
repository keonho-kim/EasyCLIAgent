/**
 * IPC Handlers Index
 * 모든 IPC 핸들러들을 통합 관리 (SRP 준수)
 */

import { setupDirectoryHandlers } from './directoryHandlers';
import { setupAgentHandlers } from './agentHandlers';
import { setupFileSystemHandlers } from './fileSystemHandlers';
import { setupAppHandlers } from './appHandlers';
import type { AgentService } from '../services/AgentService';

export function setupAllIpcHandlers(agentService: AgentService) {
  setupDirectoryHandlers();
  setupAgentHandlers(agentService);
  setupFileSystemHandlers();
  setupAppHandlers();
}