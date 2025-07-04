import { watch, FSWatcher } from 'chokidar';
import path from 'path';

export class FileSystemService {
  private watcher: FSWatcher | null = null;
  private currentWatchPath: string | null = null;

  startWatching(
    directoryPath: string, 
    callback: (event: string, filePath: string) => void
  ): void {
    // 기존 감시 중지
    this.stopWatching();

    try {
      this.currentWatchPath = directoryPath;
      
      // chokidar 설정
      this.watcher = watch(directoryPath, {
        ignored: [
          // 일반적으로 무시할 파일/폴더들
          /(^|[\/\\])\../, // 숨김 파일
          /node_modules/,
          /\.git/,
          /dist/,
          /build/,
          /coverage/,
          /\.nyc_output/,
          /\.vscode/,
          /\.idea/,
          /\.DS_Store/,
          /Thumbs\.db/,
          /\.log$/,
          /\.tmp$/,
          /\.temp$/,
        ],
        persistent: true,
        ignoreInitial: true, // 초기 스캔 이벤트 무시
        followSymlinks: false,
        depth: 5, // 깊이 제한으로 성능 향상
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 50
        }
      });

      // 이벤트 리스너 등록
      this.watcher
        .on('add', (filePath) => {
          callback('add', this.getRelativePath(filePath));
        })
        .on('change', (filePath) => {
          callback('change', this.getRelativePath(filePath));
        })
        .on('unlink', (filePath) => {
          callback('unlink', this.getRelativePath(filePath));
        })
        .on('addDir', (dirPath) => {
          callback('addDir', this.getRelativePath(dirPath));
        })
        .on('unlinkDir', (dirPath) => {
          callback('unlinkDir', this.getRelativePath(dirPath));
        })
        .on('error', (error) => {
          console.error('파일 시스템 감시 오류:', error);
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          callback('error', errorMessage);
        })
        .on('ready', () => {
          console.log(`파일 시스템 감시 시작: ${directoryPath}`);
          callback('ready', directoryPath);
        });

    } catch (error) {
      console.error('파일 시스템 감시 시작 실패:', error);
      throw error;
    }
  }

  stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      console.log(`파일 시스템 감시 중지: ${this.currentWatchPath}`);
    }
    this.currentWatchPath = null;
  }

  isWatching(): boolean {
    return this.watcher !== null;
  }

  getCurrentWatchPath(): string | null {
    return this.currentWatchPath;
  }

  private getRelativePath(absolutePath: string): string {
    if (!this.currentWatchPath) {
      return absolutePath;
    }
    
    try {
      return path.relative(this.currentWatchPath, absolutePath);
    } catch (error) {
      console.warn('상대 경로 계산 실패:', error);
      return absolutePath;
    }
  }

  // 특정 파일 패턴을 무시하는 필터 추가
  addIgnorePattern(pattern: string): void {
    if (this.watcher) {
      this.watcher.add(pattern);
    }
  }

  // 감시 중인 파일 목록 가져오기
  getWatchedPaths(): string[] {
    if (!this.watcher) {
      return [];
    }
    
    const watched = this.watcher.getWatched();
    const paths: string[] = [];
    
    for (const [dir, files] of Object.entries(watched)) {
      if (Array.isArray(files)) {
        files.forEach(file => {
          paths.push(path.join(dir, file));
        });
      }
    }
    
    return paths;
  }

  // 감시 통계 정보
  getWatchStats(): {
    isWatching: boolean;
    watchPath: string | null;
    watchedFileCount: number;
  } {
    return {
      isWatching: this.isWatching(),
      watchPath: this.currentWatchPath,
      watchedFileCount: this.getWatchedPaths().length
    };
  }
}