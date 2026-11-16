import { Pressable, View } from 'react-native';
import { radius, spacing, useTheme } from './theme';
import { Txt } from './Txt';

interface Props {
  options: { value: number; label: string }[];
  value: number | null;
  onChange: (value: number | null) => void;
}

export function Chips({ options, value, onChange }: Props) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(active ? null : option.value)}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: active ? theme.primary : theme.border,
              backgroundColor: active ? theme.primary : theme.surface,
            }}
          >
            <Txt variant="body" style={{ color: active ? theme.onPrimary : theme.text }}>
              {option.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
