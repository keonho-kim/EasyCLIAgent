/**
 * @type {import('electron-builder').Configuration}
 */
const config = {
  appId: 'com.easycliagent.app',
  productName: 'EasyCLIAgent',
  copyright: 'Copyright © 2024 EasyCLIAgent',
  
  // 빌드 디렉토리 설정
  directories: {
    output: 'dist',
    buildResources: 'build',
  },
  
  // 포함할 파일들
  files: [
    'dist-renderer/**/*',
    'dist-electron/**/*',
    'node_modules/**/*',
    'package.json',
  ],
  
  // 제외할 파일들
  extraResources: [
    {
      from: 'assets',
      to: 'assets',
      filter: ['**/*'],
    },
  ],
  
  // macOS 설정
  mac: {
    category: 'public.app-category.developer-tools',
    icon: 'build/icon.icns',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64'],
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64'],
      },
    ],
  },
  
  // Windows 설정
  win: {
    icon: 'build/icon.ico',
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
      {
        target: 'portable',
        arch: ['x64'],
      },
    ],
  },
  
  // Linux 설정
  linux: {
    icon: 'build/icon.png',
    category: 'Development',
    target: [
      {
        target: 'AppImage',
        arch: ['x64'],
      },
      {
        target: 'deb',
        arch: ['x64'],
      },
      {
        target: 'rpm',
        arch: ['x64'],
      },
    ],
  },
  
  // NSIS 설정 (Windows 인스톨러)
  nsis: {
    oneClick: false,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'EasyCLIAgent',
  },
  
  // DMG 설정 (macOS)
  dmg: {
    title: '${productName} ${version}',
    icon: 'build/icon.icns',
    background: 'build/dmg-background.png',
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications',
      },
      {
        x: 130,
        y: 150,
        type: 'file',
      },
    ],
    window: {
      width: 540,
      height: 380,
    },
  },
  
  // 코드 사이닝 (선택사항) - 현재 비활성화
  // afterSign: 'scripts/notarize.js',
  
  // 퍼블리시 설정
  publish: [
    {
      provider: 'github',
      owner: 'keonho-kim',
      repo: 'EasyCLIAgent',
      private: false,
    },
  ],
  
  // 압축 설정
  compression: 'maximum',
  
  // 보안 설정
  npmRebuild: true,
  nodeGypRebuild: false,
};

export default config;