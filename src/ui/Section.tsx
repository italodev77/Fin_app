import { View } from 'react-native';
import { formatBRL } from '@/domain/money';
import { Card } from './Card';
import { spacing, useTheme } from './theme';
import { Txt } from './Txt';

interface Props {
  title: string;
  totalCents?: number;
  empty: string;
  isEmpty: boolean;
  children: React.ReactNode;
}

export function Section({ title, totalCents, empty, isEmpty, children }: Props) {
  const theme = useTheme();
  const items = Array.isArray(children) ? children : [children];

  return (
    <Card style={{ paddingVertical: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Txt variant="heading">{title}</Txt>
        {totalCents !== undefined ? (
          <Txt variant="amount" color="muted">
            {formatBRL(totalCents)}
          </Txt>
        ) : null}
      </View>
      {isEmpty ? (
        <Txt variant="caption" color="muted" style={{ paddingVertical: spacing.md }}>
          {empty}
        </Txt>
      ) : (
        items.map((child, index) => (
          <View
            key={index}
            style={{
              borderTopWidth: index === 0 ? 0 : 1,
              borderTopColor: theme.border,
            }}
          >
            {child}
          </View>
        ))
      )}
    </Card>
  );
}
