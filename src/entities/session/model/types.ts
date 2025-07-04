export interface Session {
  id: string;
  workspaceDir: string;
  workspaceName: string;
  startTime: Date;
  messageCount: number;
  toolCallCount: number;
}

export interface SessionState {
  current: Session | null;
  isInitialized: boolean;
}

export interface CreateSessionParams {
  workspaceDir: string;
  workspaceName: string;
}