import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useApp } from '@/store/app';
import { useTheme } from '@/ui/theme';

export default function RootLayout() {
  const theme = useTheme();
  const ready = useApp((state) => state.ready);

  useEffect(() => {
    const { init, syncPermission, refresh } = useApp.getState();
    init().catch((error) => console.warn('Falha ao iniciar', error));

    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      syncPermission()
        .then(refresh)
        .catch((error) => console.warn('Falha ao sincronizar', error));
    });
    return () => subscription.remove();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="lancamento" options={{ presentation: 'modal', title: 'Lançamento' }} />
        <Stack.Screen name="conta" options={{ presentation: 'modal', title: 'Conta recorrente' }} />
        <Stack.Screen name="instancia" options={{ presentation: 'modal', title: 'Conta do mês' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
