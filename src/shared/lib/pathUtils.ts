/**
 * Path utility functions for cross-platform file path operations
 * Follows SOLID principles and DRY approach
 */

/**
 * Shortens a file path for display purposes
 * Works across Windows, macOS, and Linux platforms
 * 
 * @param fullPath - The complete file path to shorten
 * @returns A shortened, user-friendly path representation
 * 
 * Examples:
 * - Windows: "C:\Users\user\Documents\project" → "C:\...\Documents\project"
 * - macOS: "/Users/user/Documents/project" → "~/Documents/project"
 * - Long paths: "/Users/user/very/deep/folder/structure" → "~/...folder/structure"
 */
export const getShortPath = (fullPath: string): string => {
  const isWindows = /^[A-Z]:\\/.test(fullPath);
  const separator = isWindows ? '\\' : '/';
  const parts = fullPath.split(separator).filter(part => part.length > 0);
  
  if (isWindows) {
    // Windows: Show drive + last 2 folders (e.g., C:\...\Documents\project)
    const drive = parts[0]; // C:
    if (parts.length > 3) {
      const lastParts = parts.slice(-2);
      return `${drive}\\...\\${lastParts.join('\\')}`;
    }
    return fullPath;
  } else {
    // macOS/Linux: Show last 2-3 folders or home-relative path
    if (fullPath.includes('/Users/') && parts.length > 3) {
      // Try to show ~/... format
      const userIndex = parts.findIndex(part => part === 'Users');
      if (userIndex >= 0 && userIndex + 1 < parts.length) {
        const userName = parts[userIndex + 1];
        const userHomePath = `/Users/${userName}`;
        
        if (fullPath.startsWith(userHomePath)) {
          const relativePath = fullPath.replace(userHomePath, '~');
          const relativeParts = relativePath.split('/').filter(part => part.length > 0);
          
          if (relativeParts.length > 2) {
            const lastParts = relativeParts.slice(-2);
            return `~/.../${lastParts.join('/')}`;
          }
          return relativePath || '~';
        }
      }
    }
    
    // Fallback: show last 2 folders
    if (parts.length > 2) {
      const lastParts = parts.slice(-2);
      return `.../${lastParts.join('/')}`;
    }
    return fullPath;
  }
};

/**
 * Gets the directory name from a path (cross-platform)
 * @param path - The file path
 * @returns The directory name
 */
export const getDirectoryName = (path: string): string => {
  const isWindows = /^[A-Z]:\\/.test(path);
  const separator = isWindows ? '\\' : '/';
  const parts = path.split(separator);
  return parts[parts.length - 1] || path;
};

/**
 * Normalizes path separators for the current platform
 * @param path - The path to normalize
 * @returns Normalized path
 */
export const normalizePath = (path: string): string => {
  const isWindows = process.platform === 'win32';
  const separator = isWindows ? '\\' : '/';
  const oppositeSeparator = isWindows ? '/' : '\\';
  
  return path.split(oppositeSeparator).join(separator);
};