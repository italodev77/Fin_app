import { View, type ViewProps } from 'react-native';
import { radius, spacing, useTheme } from './theme';

export function Card({ style, ...rest }: ViewProps) {
  const theme = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: radius.md,
          padding: spacing.lg,
        },
        style,
      ]}
    />
  );
}
