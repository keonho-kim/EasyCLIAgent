// Theme-related utilities extracted from appStore for better separation of concerns

export const getThemeColors = (theme: 'dark' | 'light') => {
  const colors = {
    dark: {
      primary: '#4285f4',
      secondary: '#34a853',
      background: '#1e1e1e',
      surface: '#2d2d2d',
      text: '#ffffff',
      textSecondary: '#b3b3b3',
    },
    light: {
      primary: '#1976d2',
      secondary: '#2e7d32',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#000000',
      textSecondary: '#666666',
    },
  };
  
  return colors[theme];
};