// App-related utilities extracted from appStore
import type { AppConfig } from '../types';

export const isDevelopment = (config: AppConfig | null) => config?.isDev ?? false;

export const getPlatformInfo = (config: AppConfig | null) => ({
  platform: config?.platform ?? 'unknown',
  version: config?.version ?? '0.0.0',
  isDev: config?.isDev ?? false,
});