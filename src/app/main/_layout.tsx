import { useAppColors } from "@/theme/colors";
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function PrivateTabsLayout() {
  const colors = useAppColors();

  return (
    <NativeTabs tintColor={colors.accent} backgroundColor={colors.surface}>
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>Inicio</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Ajustes</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape.fill" md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
