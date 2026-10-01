import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { booksApi } from "../api/booksApi";
import type { BookPage } from "../types";

const pageSize = 100;

export function useBooks(query: string) {
  const queryClient = useQueryClient();
  const queryKey = ["books", query] as const;
  const result = useInfiniteQuery({
    queryKey,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      booksApi.getBooks({ query, offset: pageParam, limit: pageSize, signal }),
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    refetchOnWindowFocus: false,
  });

  async function refresh() {
    await queryClient.cancelQueries({ queryKey, exact: true });
    queryClient.setQueryData<InfiniteData<BookPage, number>>(queryKey, (current) =>
      current
        ? { pages: current.pages.slice(0, 1), pageParams: current.pageParams.slice(0, 1) }
        : current,
    );
    return result.refetch();
  }

  return { ...result, refresh };
}
