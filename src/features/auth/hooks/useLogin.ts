import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import type { LoginCredentials } from "../types";
import { useAuth } from "../context/AuthProvider";

export function useLogin() {
  const { signIn, restoreError } = useAuth();

  const mutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => signIn(credentials),
  });

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        return await mutation.mutateAsync(credentials);
      } catch {
        return null;
      }
    },
    [mutation],
  );

  const errorMessage =
    mutation.error instanceof Error
      ? mutation.error.message
      : mutation.error
        ? "No se pudo iniciar sesión."
        : null;

  return {
    error: errorMessage ?? restoreError,
    isLoading: mutation.isPending,
    login,
    clearError: mutation.reset,
  };
}
