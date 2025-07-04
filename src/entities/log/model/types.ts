export interface Log {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'system' | 'gemini' | 'tool' | 'file' | 'user';
  message: string;
  metadata?: Record<string, any>;
}

export interface LogState {
  logs: Log[];
  filterLevel: Log['level'] | 'all';
}