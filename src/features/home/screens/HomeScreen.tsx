import { AppText, Button, Loader } from "@/components/ui";
import { useAppColors } from "@/theme/colors";
import { useMemo } from "react";
import { FlatList, View } from "react-native";
import { BookCard } from "../components/BookCard";
import { useBooks } from "../hooks/useBooks";

const featuredQuery = "fiction";

export function HomeScreen() {
  const colors = useAppColors();
  const {
    data,
    isPending,
    isError,
    isFetching,
    isRefetching,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refresh,
  } = useBooks(featuredQuery);
  const books = useMemo(() => data?.pages.flatMap((page) => page.books) ?? [], [data]);

  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerClassName="px-6 pb-8 pt-4"
      contentInsetAdjustmentBehavior="automatic"
      data={books}
      keyExtractor={(book) => book.id}
      renderItem={({ item }) => <BookCard book={item} />}
      ItemSeparatorComponent={() => <View className="h-3" />}
      refreshing={isRefetching}
      onRefresh={() => void refresh()}
      onEndReachedThreshold={0.5}
      onEndReached={() => {
        if (books.length > 0 && hasNextPage && !isFetching && !isFetchNextPageError) {
          void fetchNextPage();
        }
      }}
      ListHeaderComponent={
        <View className="mb-6 gap-4">
          <AppText className="text-sm text-muted">
            {books.length} libros cargados de Open Library
          </AppText>
          {isError && books.length > 0 && !isFetchNextPageError ? (
            <AppText accessibilityRole="alert" className="text-sm text-danger">
              No se pudo actualizar la lista. Desliza hacia abajo para reintentar.
            </AppText>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <View className="items-center gap-4 py-12">
          {isPending ? (
            <>
              <Loader color={colors.accent} />
              <AppText className="text-sm text-muted">Cargando libros…</AppText>
            </>
          ) : isError ? (
            <>
              <AppText accessibilityRole="alert" className="text-center text-sm text-danger">
                No se pudieron cargar los libros.
              </AppText>
              <Button title="Reintentar" onPress={() => void refresh()} />
            </>
          ) : (
            <AppText className="text-center text-sm text-muted">
              No se encontraron libros.
            </AppText>
          )}
        </View>
      }
      ListFooterComponent={
        books.length > 0 && (isFetchingNextPage || isFetchNextPageError || !hasNextPage) ? (
          <View className="items-center gap-3 py-6">
            {isFetchingNextPage ? (
              <>
                <Loader color={colors.accent} />
                <AppText className="text-sm text-muted">Cargando más libros…</AppText>
              </>
            ) : isFetchNextPageError ? (
              <>
                <AppText accessibilityRole="alert" className="text-center text-sm text-danger">
                  No se pudo cargar la siguiente página.
                </AppText>
                <Button title="Reintentar" onPress={() => void fetchNextPage()} />
              </>
            ) : !hasNextPage ? (
              <AppText className="text-sm text-muted">Llegaste al final de la lista.</AppText>
            ) : null}
          </View>
        ) : null
      }
    />
  );
}
