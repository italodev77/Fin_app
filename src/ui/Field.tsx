import { TextInput, View, type TextInputProps } from 'react-native';
import { radius, spacing, useTheme } from './theme';
import { Txt } from './Txt';

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Txt variant="caption" color="muted">
        {label}
      </Txt>
      {children}
      {hint ? (
        <Txt variant="caption" color="muted">
          {hint}
        </Txt>
      ) : null}
    </View>
  );
}

export function Input(props: TextInputProps) {
  const theme = useTheme();
  return (
    <TextInput
      placeholderTextColor={theme.muted}
      {...props}
      style={[
        {
          minHeight: 48,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          color: theme.text,
          backgroundColor: theme.surface,
          fontSize: 16,
        },
        props.style,
      ]}
    />
  );
}
