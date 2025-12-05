/**
 * Design tokens for the Wardrobe Designer app
 * Eye-safe black & white palette
 */

export const colors = {
  // Primary palette - eye-safe
  background: '#FAFAFA', // soft white
  text: '#1A1A1A', // soft black
  secondary: '#4A4A4A', // medium gray for secondary text
  muted: '#6A6A6A', // lighter gray for muted text
  border: '#E5E5E5', // light border
  borderHover: '#D5D5D5', // darker border on hover
  highlight: '#E8E8E8', // subtle highlight

  // Interactive states
  backgroundHover: '#F5F5F5',
  backgroundPress: '#EEEEEE',
  backgroundFocus: '#F0F0F0',

  // Accent
  accent: '#333333',
  accentHover: '#1A1A1A',

  // Semantic colors
  success: '#2E7D32',
  warning: '#ED6C02',
  error: '#D32F2F',
  info: '#0288D1',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type Radius = typeof radius;
export type Shadows = typeof shadows;
