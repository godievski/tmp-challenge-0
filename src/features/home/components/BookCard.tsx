import { AppText } from "@/components/ui";
import { View } from "react-native";
import type { Book } from "../types";

export function BookCard({ book }: { book: Book }) {
  const author = book.authors[0] ?? "Autor desconocido";
  const detail = book.firstPublishedYear
    ? `${author} · ${book.firstPublishedYear}`
    : author;

  return (
    <View className="flex-row items-center gap-4 rounded-xl border border-border bg-surface p-4">
      <View className="flex-1 gap-1.5">
        <AppText weight="semibold" numberOfLines={2} className="text-base text-foreground">
          {book.title}
        </AppText>
        <AppText numberOfLines={2} className="text-sm/5 text-muted">
          {detail}
        </AppText>
      </View>
      <View
        accessible
        accessibilityLabel={`${book.editionCount} ediciones`}
        className="min-h-12 min-w-12 items-center justify-center rounded-lg border border-border bg-background px-2 py-1"
      >
        <AppText weight="semibold" className="text-base text-foreground">
          {book.editionCount}
        </AppText>
        <AppText className="text-xs text-muted">ed.</AppText>
      </View>
    </View>
  );
}
