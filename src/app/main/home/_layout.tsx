import { useAppColors } from "@/theme/colors";
import { Stack } from "expo-router";

export default function HomeStackLayout() {
  const colors = useAppColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Libros" }} />
    </Stack>
  );
}
