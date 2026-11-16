import { Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme, type Theme } from './theme';

type Variant = 'title' | 'heading' | 'body' | 'caption' | 'amount';

const variants: Record<Variant, TextStyle> = {
  title: { fontSize: 22, fontWeight: '700' },
  heading: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 15 },
  caption: { fontSize: 12 },
  amount: { fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },
};

interface Props extends TextProps {
  variant?: Variant;
  color?: keyof Theme;
}

export function Txt({ variant = 'body', color = 'text', style, ...rest }: Props) {
  const theme = useTheme();
  return <Text {...rest} style={[variants[variant], { color: theme[color] }, style]} />;
}
