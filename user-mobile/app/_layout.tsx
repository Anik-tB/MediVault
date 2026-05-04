import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { Palette } from '@/constants/theme';
import { AuthProvider } from '@/hooks/use-auth';

export default function RootLayout() {
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Palette.background,
      border: Palette.border,
      card: Palette.background,
      primary: Palette.primary,
      text: Palette.text,
    },
  };

  return (
    <AuthProvider>
      <ThemeProvider value={theme}>
        <Stack
          screenOptions={{
            animation: 'fade',
            contentStyle: { backgroundColor: Palette.background },
            headerShown: false,
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login/index" />
          <Stack.Screen name="dashboard/index" />
          <Stack.Screen name="search_medicine/index" />
          <Stack.Screen name="cart/index" />
          <Stack.Screen name="orders/index" />
          <Stack.Screen name="prescriptions/index" />
          <Stack.Screen name="prescriptions/preview" />
          <Stack.Screen name="prescriptions/success" />
          <Stack.Screen name="sign-up/index" />
          <Stack.Screen name="sign-up/security" />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </AuthProvider>
  );
}
