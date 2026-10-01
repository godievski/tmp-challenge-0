import { useCallback, useMemo } from "react";
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useSettingsStore } from "@/shared/store/useSettingsStore";
import { booksQueryOptions } from "../api/booksQueryOptions";
import type { BookPage } from "../types";

export function useBooks(query: string) {
  const queryClient = useQueryClient();
  const pageSize = useSettingsStore((state) => state.bookPageSize);
  const options = useMemo(() => booksQueryOptions(query, pageSize), [query, pageSize]);
  const { queryKey } = options;
  const result = useInfiniteQuery(options);
  const { refetch, fetchNextPage } = result;
  const books = useMemo(() => result.data?.pages.flatMap((page) => page.books) ?? [], [result.data]);

  // Read the cache at invocation time, including calls before React renders again.
  const requestNextPage = useCallback(async (retry: boolean) => {
    const state = queryClient.getQueryState<InfiniteData<BookPage, number>>(queryKey);
    const lastPage = state?.data?.pages.at(-1);
    if (!lastPage || lastPage.nextOffset == null || state?.fetchStatus !== "idle") return;
    if (!retry && state.status === "error") return;
    return fetchNextPage({ cancelRefetch: false });
  }, [fetchNextPage, queryClient, queryKey]);

  const loadNextPage = useCallback(() => requestNextPage(false), [requestNextPage]);
  const retryNextPage = useCallback(() => requestNextPage(true), [requestNextPage]);

  const refresh = useCallback(async () => {
    await queryClient.cancelQueries({ queryKey, exact: true });
    queryClient.setQueryData<InfiniteData<BookPage, number>>(queryKey, (current) =>
      current
        ? { pages: current.pages.slice(0, 1), pageParams: current.pageParams.slice(0, 1) }
        : current,
    );
    return refetch();
  }, [queryClient, queryKey, refetch]);

  const nextPageStatus = result.isFetchingNextPage ? "loading"
    : result.isFetchNextPageError ? "error"
    : !result.hasNextPage ? "complete" : "idle";

  return {
    books,
    pageSize,
    isLoading: result.isPending,
    isRefreshing: result.isRefetching,
    hasInitialError: result.isError && !result.data,
    hasRefreshError: result.isRefetchError && !result.isFetchNextPageError,
    nextPageStatus,
    loadNextPage,
    retryNextPage,
    refresh,
  };
}
