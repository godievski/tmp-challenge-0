import { useCSSVariable } from "uniwind";

const colorVariables = {
  background: "--color-background",
  surface: "--color-surface",
  foreground: "--color-foreground",
  muted: "--color-muted",
  border: "--color-border",
  accent: "--color-accent",
  onAccent: "--color-accent-foreground",
  error: "--color-danger",
};

export type AppColors = Record<keyof typeof colorVariables, string>;

export function useAppColors(): AppColors {
  const values = useCSSVariable(Object.values(colorVariables));

  return Object.fromEntries(
    Object.keys(colorVariables).map((key, index) => [key, values[index]]),
  ) as AppColors;
}
