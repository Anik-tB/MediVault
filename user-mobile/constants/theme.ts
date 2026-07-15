import { Platform } from 'react-native';

export const Palette = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  primary: '#0D9488',
  primaryPressed: '#0F766E',
  text: '#0F172A',
  textMuted: '#475569',
  textSoft: '#64748B',
  label: '#475569',
  border: '#E2E8F0',
  borderSoft: '#F1F5F9',
  shadowSoft: 'rgba(15, 23, 42, 0.04)',
  disabled: '#CBD5E1',
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
