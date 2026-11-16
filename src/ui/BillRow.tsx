import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { formatBRL } from '@/domain/money';
import type { StatusBadge } from './status';
import { radius, spacing, useTheme } from './theme';
import { Txt } from './Txt';

interface Props {
  name: string;
  subtitle: string;
  amountCents: number;
  badge?: StatusBadge;
  paid?: boolean;
  signed?: '+' | '-';
  onToggle?: () => void;
  onPress: () => void;
}

export function BillRow({
  name,
  subtitle,
  amountCents,
  badge,
  paid,
  signed,
  onToggle,
  onPress,
}: Props) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {onToggle ? (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: !!paid }}
          accessibilityLabel={paid ? 'Marcar como pendente' : 'Marcar como paga'}
          hitSlop={10}
          onPress={onToggle}
        >
          <Ionicons
            name={paid ? 'checkmark-circle' : 'ellipse-outline'}
            size={28}
            color={paid ? theme.success : theme.muted}
          />
        </Pressable>
      ) : null}

      <View style={{ flex: 1, gap: 2 }}>
        <Txt
          variant="body"
          style={paid ? { textDecorationLine: 'line-through', opacity: 0.6 } : undefined}
        >
          {name}
        </Txt>
        <Txt variant="caption" color="muted">
          {subtitle}
        </Txt>
      </View>

      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Txt variant="amount" color={signed === '+' ? 'success' : 'text'}>
          {signed ? `${signed} ` : ''}
          {formatBRL(amountCents)}
        </Txt>
        {badge ? (
          <View
            style={{
              backgroundColor: theme[badge.background],
              borderRadius: radius.sm,
              paddingHorizontal: spacing.sm,
              paddingVertical: 2,
            }}
          >
            <Txt variant="caption" color={badge.color}>
              {badge.label}
            </Txt>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
