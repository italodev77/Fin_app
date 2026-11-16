import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { spacing, useTheme } from './theme';

export function Screen({ children, contentContainerStyle, ...rest }: ScrollViewProps) {
  const theme = useTheme();
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      {...rest}
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={[
        { padding: spacing.lg, gap: spacing.lg, paddingBottom: 120 },
        contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  );
}

export function Row({
  children,
  gap = spacing.md,
}: {
  children: React.ReactNode;
  gap?: number;
}) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap }}>{children}</View>;
}
