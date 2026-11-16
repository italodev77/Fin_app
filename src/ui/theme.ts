import { useColorScheme } from 'react-native';

const light = {
  bg: '#F3F6F4',
  surface: '#FFFFFF',
  text: '#14201B',
  muted: '#5F6F68',
  border: '#DAE2DD',
  primary: '#1B7F5C',
  onPrimary: '#FFFFFF',
  danger: '#C0392B',
  warning: '#B26A00',
  success: '#1B7F5C',
  dangerBg: '#FBE9E7',
  warningBg: '#FFF1D6',
  successBg: '#E1F3EA',
};

const dark: Theme = {
  bg: '#0E1512',
  surface: '#17211C',
  text: '#E8F0EC',
  muted: '#9AAAA2',
  border: '#2A3731',
  primary: '#3FBF8C',
  onPrimary: '#06231A',
  danger: '#FF7B6E',
  warning: '#F2B24C',
  success: '#3FBF8C',
  dangerBg: '#3A1D19',
  warningBg: '#3A2E14',
  successBg: '#15301F',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 8, md: 12, lg: 16 };
