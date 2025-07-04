export interface Directory {
  path: string;
  name: string;
}

export interface DirectoryState {
  selected: Directory | null;
  isSelecting: boolean;
}