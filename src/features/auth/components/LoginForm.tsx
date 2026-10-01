import { AppText, Button, TextField } from "@/components/ui";
import { useAppColors } from "@/theme/colors";
import Ionicons from "@react-native-vector-icons/ionicons";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { loginSchema } from "../schemas/loginSchema";
import { useLogin } from "../hooks/useLogin";

function getErrorMessage(errors: readonly unknown[]): string | null {
  const error = errors.find(Boolean);

  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return typeof error.message === "string" ? error.message : null;
  }

  return null;
}

export function LoginForm() {
  const colors = useAppColors();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { error, isLoading, login, clearError } = useLogin();

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: loginSchema },
    onSubmit: async ({ value }) => {
      clearError();
      await login(value);
    },
  });

  return (
    <View className="gap-4">
      <form.Field name="email">
        {(field) => (
          <TextField
            error={getErrorMessage(field.state.meta.errors)}
            inputProps={{
              accessibilityLabel: "Correo electrónico",
              value: field.state.value,
              onChangeText: (value) => {
                clearError();
                field.handleChange(value);
              },
              onBlur: field.handleBlur,
              placeholder: "Correo electrónico",
              keyboardType: "email-address",
              autoCapitalize: "none",
              autoCorrect: false,
              autoComplete: "email",
              textContentType: "emailAddress",
              returnKeyType: "next",
              editable: !isLoading,
            }}
          />
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <TextField
            error={getErrorMessage(field.state.meta.errors)}
            inputProps={{
              accessibilityLabel: "Contraseña",
              value: field.state.value,
              onChangeText: (value) => {
                clearError();
                field.handleChange(value);
              },
              onBlur: field.handleBlur,
              placeholder: "Contraseña",
              secureTextEntry: !passwordVisible,
              autoCapitalize: "none",
              autoCorrect: false,
              autoComplete: "current-password",
              textContentType: "password",
              returnKeyType: "done",
              editable: !isLoading,
              onSubmitEditing: () => void form.handleSubmit(),
            }}
            trailingAccessory={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                onPress={() => setPasswordVisible((visible) => !visible)}
                disabled={isLoading}
                className="min-h-11 min-w-8 items-center justify-center"
                hitSlop={8}
              >
                <Ionicons
                  name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.muted}
                />
              </Pressable>
            }
          />
        )}
      </form.Field>

      {error ? (
        <View className="flex-row items-center gap-2.5 rounded-lg border border-border bg-surface p-3">
          <Ionicons
            name="alert-circle-outline"
            size={18}
            color={colors.error}
          />
          <AppText accessibilityRole="alert" className="flex-1 text-sm text-danger">
            {error}
          </AppText>
        </View>
      ) : null}

      <Button
        title="Iniciar sesión"
        icon={<Ionicons name="arrow-forward" size={20} color={colors.onAccent} />}
        onPress={() => void form.handleSubmit()}
        loading={isLoading}
        accessibilityLabel={isLoading ? "Ingresando" : "Iniciar sesión"}
      />
    </View>
  );
}
