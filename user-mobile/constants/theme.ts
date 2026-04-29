import { Platform } from 'react-native';

export const Palette = {
  background: '#F4F7FC',
  surface: '#FFFFFF',
  surfaceMuted: '#F7FAFF',
  primary: '#2563FF',
  primaryPressed: '#1D53DB',
  text: '#17213C',
  textMuted: '#6E7FA1',
  textSoft: '#94A6C4',
  label: '#556784',
  border: '#D8E2F1',
  borderSoft: '#E9EFF8',
  shadowSoft: 'rgba(23, 33, 60, 0.08)',
  disabled: '#D7E0EE',
};

export const Colors = {
  light: {
    text: Palette.text,
    background: Palette.background,
    tint: Palette.primary,
    icon: Palette.textMuted,
    tabIconDefault: Palette.textMuted,
    tabIconSelected: Palette.primary,
  },
  dark: {
    text: Palette.text,
    background: Palette.background,
    tint: Palette.primary,
    icon: Palette.textMuted,
    tabIconDefault: Palette.textMuted,
    tabIconSelected: Palette.primary,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'sans-serif-medium',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Segoe UI', sans-serif",
    mono: "SFMono-Regular, Menlo, Consolas, monospace",
  },
});
