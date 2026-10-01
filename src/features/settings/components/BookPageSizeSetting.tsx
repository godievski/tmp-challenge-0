import { AppText, Loader } from "@/components/ui";
import { useAppColors } from "@/theme/colors";
import { Pressable, View } from "react-native";
import { useBookPageSize } from "../hooks/useBookPageSize";
import { BOOK_PAGE_SIZES } from "@/shared/store/useSettingsStore";

export function BookPageSizeSetting() {
  const { pageSize, changePageSize, isChanging } = useBookPageSize();
  const colors = useAppColors();

  return (
    <View className="mt-6 gap-3">
      <AppText weight="semibold" className="text-base text-foreground">
        Libros por página
      </AppText>
      <AppText className="text-sm text-muted">
        Se aplica a Inicio. Al cambiar, la lista empieza desde el principio.
      </AppText>
      <View accessibilityRole="radiogroup" accessibilityLabel="Libros por página"
        className="gap-2">
        {BOOK_PAGE_SIZES.map((size) => {
          const selected = size === pageSize;
          return (
            <Pressable key={size} accessibilityRole="radio"
              accessibilityLabel={`${size} libros`}
              accessibilityState={{ checked: selected, disabled: isChanging }}
              disabled={isChanging}
              onPress={() => changePageSize(size)}
              className={`min-h-12 flex-row items-center justify-between rounded-lg border px-4 py-3 ${
                selected ? "border-accent bg-accent" : "border-border bg-surface"
              }`}>
              <AppText weight={selected ? "semibold" : "regular"}
                className={selected ? "text-accent-foreground" : "text-foreground"}>
                {size} libros
              </AppText>
              {selected ? (
                isChanging ? <Loader color={colors.onAccent} /> : (
                  <AppText className="text-sm text-accent-foreground">Seleccionado</AppText>
                )
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
