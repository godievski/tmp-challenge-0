import { Loader } from "@/components/ui/Loader";
import { Button as HeroButton } from "heroui-native/button";
import { useThemeColor } from "heroui-native/hooks";
import type { ReactNode } from "react";

export type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  accessibilityLabel?: string;
};

export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  accessibilityLabel,
}: ButtonProps) {
  const color = useThemeColor("accent-foreground");
  const isDisabled = disabled || loading;

  return (
    <HeroButton
      className="h-12 w-full rounded-lg"
      onPress={onPress}
      isDisabled={isDisabled}
      style={{ opacity: loading ? 1 : undefined }}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ busy: loading, disabled: isDisabled }}
    >
      {loading ? (
        <Loader color={color} />
      ) : (
        <>
          {icon}
          <HeroButton.Label className="font-geist-semibold" numberOfLines={1}>
            {title}
          </HeroButton.Label>
        </>
      )}
    </HeroButton>
  );
}
