import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { startSystemNotifications } from './services/NotificationService';

export default function Layout() {
  useEffect(() => {
    startSystemNotifications();
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="splashscreen" />
        <Stack.Screen name="loginscreen" />
        <Stack.Screen name="signupscreen" />
        <Stack.Screen name="home" />
      </Stack>
    </GestureHandlerRootView>
  );
}
