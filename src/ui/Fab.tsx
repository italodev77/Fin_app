import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './theme';

export function Fab({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Novo lançamento"
      onPress={onPress}
      style={({ pressed }) => ({
        position: 'absolute',
        right: 20,
        bottom: 76 + insets.bottom,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.primary,
        opacity: pressed ? 0.85 : 1,
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      })}
    >
      <Ionicons name="add" size={28} color={theme.onPrimary} />
    </Pressable>
  );
}
