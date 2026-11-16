import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { monthLabel } from '@/domain/month';
import { useApp } from '@/store/app';
import { spacing, useTheme } from './theme';
import { Txt } from './Txt';

export function MonthSwitcher() {
  const theme = useTheme();
  const month = useApp((state) => state.month);
  const shiftMonth = useApp((state) => state.shiftMonth);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
      }}
    >
      <Pressable
        accessibilityLabel="Mês anterior"
        hitSlop={12}
        onPress={() => shiftMonth(-1)}
        style={{ padding: spacing.sm }}
      >
        <Ionicons name="chevron-back" size={24} color={theme.text} />
      </Pressable>
      <Txt variant="title">{monthLabel(month)}</Txt>
      <Pressable
        accessibilityLabel="Próximo mês"
        hitSlop={12}
        onPress={() => shiftMonth(1)}
        style={{ padding: spacing.sm }}
      >
        <Ionicons name="chevron-forward" size={24} color={theme.text} />
      </Pressable>
    </View>
  );
}
