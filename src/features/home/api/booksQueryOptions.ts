import { infiniteQueryOptions } from "@tanstack/react-query";
import type { BookPageSize } from "@/shared/store/useSettingsStore";
import { booksApi } from "./booksApi";

export const FEATURED_BOOKS_QUERY = "fiction";
export const BOOKS_QUERY_KEY = ["books"] as const;

export function booksQueryOptions(query: string, pageSize: BookPageSize) {
  return infiniteQueryOptions({
    queryKey: [...BOOKS_QUERY_KEY, query, pageSize] as const,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      booksApi.getBooks({ query, offset: pageParam, limit: pageSize, signal }),
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    refetchOnWindowFocus: false,
  });
}
