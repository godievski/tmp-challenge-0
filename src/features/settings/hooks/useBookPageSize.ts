import { noop, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BOOKS_QUERY_KEY,
  FEATURED_BOOKS_QUERY,
  booksQueryOptions,
} from "@/features/home/api/booksQueryOptions";
import { useSettingsStore, type BookPageSize } from "@/shared/store/useSettingsStore";

export function useBookPageSize() {
  const queryClient = useQueryClient();
  const pageSize = useSettingsStore((state) => state.bookPageSize);
  const mutation = useMutation({
    mutationFn: async (nextSize: BookPageSize) => {
      if (nextSize === useSettingsStore.getState().bookPageSize) return;
      await queryClient.cancelQueries({ queryKey: BOOKS_QUERY_KEY });
      // Invalidation alone would keep the old infinite pages and their offsets.
      queryClient.removeQueries({ queryKey: BOOKS_QUERY_KEY });
      useSettingsStore.getState().setBookPageSize(nextSize);
      // Mounted lists share this request. A prefetch error is handled by useBooks.
      await queryClient
        .infiniteQuery(booksQueryOptions(FEATURED_BOOKS_QUERY, nextSize))
        .catch(noop);
    },
  });

  return {
    pageSize,
    changePageSize: mutation.mutate,
    isChanging: mutation.isPending,
  };
}
