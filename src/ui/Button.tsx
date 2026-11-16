import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { radius, spacing, useTheme } from './theme';
import { Txt } from './Txt';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'primary', disabled, style }: Props) {
  const theme = useTheme();
  const filled = variant === 'primary';
  const tone = variant === 'danger' ? theme.danger : theme.primary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 48,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
          borderWidth: filled ? 0 : 1,
          borderColor: tone,
          backgroundColor: filled ? tone : 'transparent',
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Txt variant="heading" style={{ color: filled ? theme.onPrimary : tone }}>
        {label}
      </Txt>
    </Pressable>
  );
}
