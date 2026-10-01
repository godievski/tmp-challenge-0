import { Text, type TextProps } from "react-native";

type AppTextProps = TextProps & {
  weight?: "regular" | "medium" | "semibold" | "bold";
};

const fontClasses = {
  regular: "font-geist-regular",
  medium: "font-geist-medium",
  semibold: "font-geist-semibold",
  bold: "font-geist-bold",
} satisfies Record<NonNullable<AppTextProps["weight"]>, string>;

export function AppText({
  weight = "regular",
  className,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      className={`${fontClasses[weight]} ${className ?? ""}`}
    />
  );
}
