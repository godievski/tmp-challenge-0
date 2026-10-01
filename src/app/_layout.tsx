import { AuthProvider, useAuth } from "@/features/auth/context/AuthProvider";
import { QueryProvider } from "@/services/query/QueryProvider";
import { queryClient } from "@/services/query/queryClient";
import { useAppColors } from "@/theme/colors";
import { Geist_400Regular } from "@expo-google-fonts/geist/400Regular";
import { Geist_500Medium } from "@expo-google-fonts/geist/500Medium";
import { Geist_600SemiBold } from "@expo-google-fonts/geist/600SemiBold";
import { Geist_700Bold } from "@expo-google-fonts/geist/700Bold";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { HeroUINativeProvider } from "heroui-native/provider";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <QueryProvider>
      <AuthProvider onSignOut={() => queryClient.clear()}>
        <RootContent />
      </AuthProvider>
    </QueryProvider>
  );
}

function RootContent() {
  const { isAuthenticated, isRestoring } = useAuth();
  const colors = useAppColors();
  const [fontsLoaded, fontError] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  useEffect(() => {
    if ((fontsLoaded || fontError) && !isRestoring) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isRestoring]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  if ((!fontsLoaded && !fontError) || isRestoring) return null;

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <SafeAreaProvider>
        <KeyboardProvider>
          <HeroUINativeProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Protected guard={!isAuthenticated}>
                <Stack.Screen name="index" />
              </Stack.Protected>
              <Stack.Protected guard={isAuthenticated}>
                <Stack.Screen name="main" />
              </Stack.Protected>
            </Stack>
          </HeroUINativeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
