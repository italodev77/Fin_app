import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { View, type ColorValue } from 'react-native';
import { Fab } from '@/ui/Fab';
import { useTheme } from '@/ui/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function icon(name: IconName) {
  return function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} size={size} color={color as string} />;
  };
}

export default function TabsLayout() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          sceneStyle: { backgroundColor: theme.bg },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.muted,
          tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: icon('home-outline') }} />
        <Tabs.Screen
          name="recorrentes"
          options={{ title: 'Contas', tabBarIcon: icon('repeat-outline') }}
        />
        <Tabs.Screen name="dividas" options={{ title: 'Dívidas', tabBarIcon: icon('card-outline') }} />
        <Tabs.Screen name="receita" options={{ title: 'Receita', tabBarIcon: icon('cash-outline') }} />
        <Tabs.Screen
          name="config"
          options={{ title: 'Ajustes', tabBarIcon: icon('settings-outline') }}
        />
      </Tabs>
      <Fab onPress={() => router.push('/lancamento')} />
    </View>
  );
}
