import { AppText } from "@/components/ui";
import { useAppColors } from "@/theme/colors";
import Ionicons from "@react-native-vector-icons/ionicons";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LoginForm } from "../components/LoginForm";

export function LoginScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={insets.bottom + 24}
      >
        <View className="grow justify-center px-6">
          <View className="w-full max-w-sm self-center gap-7">
            <View className="items-center">
              <View className="size-10 items-center justify-center rounded-lg bg-foreground">
                <AppText weight="semibold" className="text-2xl text-background">
                  C
                </AppText>
              </View>
              <AppText weight="medium" className="mt-3 text-sm text-muted">
                Challenge
              </AppText>
              <AppText
                weight="semibold"
                className="mt-7 text-center text-3xl tracking-tight text-foreground"
              >
                Bienvenido de nuevo
              </AppText>
              <AppText className="mt-2 text-center text-base/6 text-muted">
                Ingresa a tu cuenta para continuar.
              </AppText>
            </View>

            <LoginForm />

            <View className="flex-row items-start gap-2.5 rounded-lg border border-border bg-surface p-4">
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={colors.muted}
              />
              <View className="flex-1 gap-1">
                <AppText weight="medium" className="text-sm text-foreground">
                  Acceso de prueba
                </AppText>
                <AppText className="text-xs/5 text-muted">
                  Usa cualquier email y la contraseña 123456.
                </AppText>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
