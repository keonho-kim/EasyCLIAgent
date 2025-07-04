// Font-related utilities extracted from appStore

export const getFontSizeInfo = (fontSize: number) => ({
  fontSize,
  lineHeight: fontSize * 1.4,
  terminalFontSize: fontSize - 2,
  iconSize: Math.max(16, fontSize),
});

export const clampFontSize = (fontSize: number) => Math.max(10, Math.min(24, fontSize));