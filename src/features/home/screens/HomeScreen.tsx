import { LegendList } from "@legendapp/list/react-native";
import { memo, useMemo } from "react";
import { View } from "react-native";
import { useResolveClassNames, withUniwind } from "uniwind";
import { AppText, Button, Loader } from "@/components/ui";
import { useAppColors } from "@/theme/colors";
import { BookCard } from "../components/BookCard";
import { FEATURED_BOOKS_QUERY } from "../api/booksQueryOptions";
import { useBooks } from "../hooks/useBooks";
import type { Book } from "../types";

const StyledLegendList = withUniwind(LegendList<Book>);
const renderBook = ({ item }: { item: Book }) => <BookCard book={item} />;
const keyExtractor = (book: Book) => book.id;
const ItemSeparator = memo(function ItemSeparator() {
  return <View className="h-3" />;
});

export function HomeScreen() {
  const colors = useAppColors();
  const contentContainerStyle = useResolveClassNames("px-6 pb-8 pt-4");
  const {
    books, pageSize, isLoading, isRefreshing, hasInitialError, hasRefreshError,
    nextPageStatus, loadNextPage, retryNextPage, refresh,
  } = useBooks(FEATURED_BOOKS_QUERY);

  const header = useMemo(() => (
    <View className="mb-6 gap-4">
      <AppText className="text-sm text-muted">{books.length} libros cargados de Open Library</AppText>
      {hasRefreshError && books.length > 0 ? (
        <AppText accessibilityRole="alert" className="text-sm text-danger">
          No se pudo actualizar la lista. Desliza hacia abajo para reintentar.
        </AppText>
      ) : null}
    </View>
  ), [books.length, hasRefreshError]);

  const empty = useMemo(() => (
    <View className="items-center gap-4 py-12">
      {isLoading ? (
        <><Loader color={colors.accent} /><AppText className="text-sm text-muted">Cargando libros…</AppText></>
      ) : hasInitialError ? (
        <>
          <AppText accessibilityRole="alert" className="text-center text-sm text-danger">
            No se pudieron cargar los libros.
          </AppText>
          <Button title="Reintentar" onPress={refresh} />
        </>
      ) : (
        <AppText className="text-center text-sm text-muted">No se encontraron libros.</AppText>
      )}
    </View>
  ), [colors.accent, hasInitialError, isLoading, refresh]);

  const footer = useMemo(() => {
    if (books.length === 0 || nextPageStatus === "idle") return null;
    return (
      <View className="items-center gap-3 py-6">
        {nextPageStatus === "loading" ? (
          <><Loader color={colors.accent} /><AppText className="text-sm text-muted">Cargando más libros…</AppText></>
        ) : nextPageStatus === "error" ? (
          <>
            <AppText accessibilityRole="alert" className="text-center text-sm text-danger">
              No se pudo cargar la siguiente página.
            </AppText>
            <Button title="Reintentar" onPress={retryNextPage} />
          </>
        ) : (
          <AppText className="text-sm text-muted">Llegaste al final de la lista.</AppText>
        )}
      </View>
    );
  }, [books.length, colors.accent, nextPageStatus, retryNextPage]);

  return (
    <StyledLegendList
      key={pageSize}
      className="flex-1 bg-background"
      contentContainerStyle={contentContainerStyle}
      contentInsetAdjustmentBehavior="automatic"
      data={books}
      keyExtractor={keyExtractor}
      renderItem={renderBook}
      ItemSeparatorComponent={ItemSeparator}
      recycleItems
      maintainVisibleContentPosition={{ data: false, size: true }}
      refreshing={isRefreshing}
      onRefresh={refresh}
      onEndReachedThreshold={0.5}
      onEndReached={loadNextPage}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ListFooterComponent={footer}
    />
  );
}
