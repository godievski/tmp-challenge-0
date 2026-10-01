import { focusManager, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { AppState } from "react-native";
import { queryClient } from "./queryClient";

export function QueryProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      focusManager.setFocused(state === "active");
    });

    return () => subscription.remove();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
