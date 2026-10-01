import { AppText, Button } from "@/components/ui";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { useState } from "react";
import { ScrollView, View } from "react-native";

export function SettingsScreen() {
  const { session, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setError(null);
    setIsLoading(true);
    try {
      await signOut();
    } catch {
      setError("No se pudo cerrar la sesión. Inténtalo nuevamente.");
      setIsLoading(false);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6 pb-8 pt-4"
      contentInsetAdjustmentBehavior="automatic"
      alwaysBounceVertical
    >
      <AppText className="mb-6 text-sm text-muted">
        Información de tu cuenta
      </AppText>
      <View className="gap-2 rounded-xl border border-border bg-surface p-3">
        <AppText weight="medium" className="text-sm text-muted">
          Correo electrónico
        </AppText>
        <AppText selectable className="text-base text-foreground">
          {session?.email}
        </AppText>
      </View>
      <View className="mt-6 gap-3">
        <Button
          title="Cerrar sesión"
          onPress={() => void handleSignOut()}
          loading={isLoading}
        />
        {error ? (
          <AppText accessibilityRole="alert" className="text-danger">
            {error}
          </AppText>
        ) : null}
      </View>
    </ScrollView>
  );
}
