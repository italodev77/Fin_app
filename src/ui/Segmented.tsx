import { Pressable, View } from 'react-native';
import { radius, spacing, useTheme } from './theme';
import { Txt } from './Txt';

interface Props<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: radius.md,
        overflow: 'hidden',
      }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={{
              flex: 1,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: spacing.sm,
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
