import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import { HttpError } from '@/services/http/httpError';
import { useBooks } from '../hooks/useBooks';

const endpoint = 'https://openlibrary.org/search.json';
const originalEndpoint = process.env.EXPO_PUBLIC_OPEN_LIBRARY_SEARCH_URL;
let queryClient: QueryClient;
let fetchMock: jest.SpyInstance;

function Providers({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function response(body: unknown, status = 200, statusText = 'OK'): Response {
  // Only the HTTP response boundary is replaced. Parsing and mapping remain real.
  return { ok: status >= 200 && status < 300, status, statusText,
    json: async () => body } as Response;
}

function page(offset: number, count = 100, total = 2010) {
  return {
    numFound: total,
    docs: Array.from({ length: count }, (_, index) => ({
      key: `/works/OL${offset + index}W`, title: `Libro ${offset + index}`,
      author_name: ['Ana Pérez'], first_publish_year: 2001, edition_count: 3,
    })),
  };
}

beforeEach(() => {
  process.env.EXPO_PUBLIC_OPEN_LIBRARY_SEARCH_URL = endpoint;
  queryClient = new QueryClient({ defaultOptions: {
    queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
  } });
  fetchMock = jest.spyOn(globalThis, 'fetch');
  fetchMock.mockRejectedValue(new Error('Unexpected HTTP request'));
});

afterEach(() => {
  queryClient.clear();
  fetchMock.mockRestore();
  if (originalEndpoint === undefined) delete process.env.EXPO_PUBLIC_OPEN_LIBRARY_SEARCH_URL;
  else process.env.EXPO_PUBLIC_OPEN_LIBRARY_SEARCH_URL = originalEndpoint;
});

describe('Books integration', () => {
  it('loads and maps more than 2000 books in pages, then stops at the API total', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      const params = new URL(url).searchParams;
      const offset = Number(params.get('offset'));
      expect(params.get('q')).toBe('ciencia ficción');
      expect(params.get('limit')).toBe('100');
      expect(params.get('lang')).toBe('es');
      return response(page(offset, offset === 2000 ? 10 : 100));
    });
    const { result } = await renderHook(() => useBooks('ciencia ficción'), { wrapper: Providers });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].books[0]).toEqual({
      id: '/works/OL0W', title: 'Libro 0', authors: ['Ana Pérez'],
      firstPublishedYear: 2001, editionCount: 3,
    });
    for (let index = 1; index <= 20; index++) {
      await act(async () => { await result.current.fetchNextPage();
        // Query schedules observer notifications on the next timer tick.
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      await waitFor(() => expect(result.current.data?.pages).toHaveLength(index + 1));
    }
    expect(result.current.data?.pages.flatMap((item) => item.books)).toHaveLength(2010);
    expect(result.current.data?.pages[20].books[9].title).toBe('Libro 2009');
    expect(result.current.hasNextPage).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(21);
    await act(async () => { await result.current.fetchNextPage();
        // Query schedules observer notifications on the next timer tick.
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    expect(fetchMock).toHaveBeenCalledTimes(21);
  });

  it('refreshes from the first page and discards the previously loaded pages', async () => {
    fetchMock.mockResolvedValueOnce(response(page(0)))
      .mockResolvedValueOnce(response(page(100)))
      .mockResolvedValueOnce(response({ numFound: 1,
        docs: [{ key: '/works/NEW', title: 'Catálogo actualizado' }] }));
    const { result } = await renderHook(() => useBooks('fiction'), { wrapper: Providers });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await act(async () => {
      await result.current.fetchNextPage();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
    await act(async () => {
      await result.current.refresh();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(result.current.data?.pages[0].books[0].title)
      .toBe('Catálogo actualizado'));
    expect(result.current.data?.pages).toHaveLength(1);
    expect(result.current.hasNextPage).toBe(false);
    expect(new URL(fetchMock.mock.calls[2][0]).searchParams.get('offset')).toBe('0');
  });

  it('preserves loaded books after a page HTTP failure and retries the same offset', async () => {
    fetchMock.mockResolvedValueOnce(response(page(0)))
      .mockResolvedValueOnce(response({ message: 'Unavailable' }, 503, 'Service Unavailable'))
      .mockResolvedValueOnce(response(page(100, 1, 101)));
    const { result } = await renderHook(() => useBooks('fiction'), { wrapper: Providers });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await act(async () => {
      await result.current.fetchNextPage();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(result.current.isFetchNextPageError).toBe(true));
    expect(result.current.error).toBeInstanceOf(HttpError);
    expect(result.current.error).toMatchObject({ status: 503, responseBody: { message: 'Unavailable' } });
    expect(result.current.data?.pages[0].books).toHaveLength(100);
    await act(async () => {
      await result.current.fetchNextPage();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
    expect(result.current.isFetchNextPageError).toBe(false);
    expect(result.current.data?.pages[1].books[0].title).toBe('Libro 100');
    expect(new URL(fetchMock.mock.calls[1][0]).searchParams.get('offset')).toBe('100');
    expect(new URL(fetchMock.mock.calls[2][0]).searchParams.get('offset')).toBe('100');
  });

  it('keeps separate cached results for each search and reuses a fresh cached search', async () => {
    fetchMock.mockResolvedValueOnce(response({ numFound: 1,
      docs: [{ key: '/works/F', title: 'Ficción' }] }))
      .mockResolvedValueOnce(response({ numFound: 1,
        docs: [{ key: '/works/H', title: 'Historia' }] }));
    const { result, rerender } = await renderHook((query: string) => useBooks(query),
      { wrapper: Providers, initialProps: 'fiction' });
    await waitFor(() => expect(result.current.data?.pages[0].books[0].title).toBe('Ficción'));
    await rerender('history');
    await waitFor(() => expect(result.current.data?.pages[0].books[0].title).toBe('Historia'));
    await rerender('fiction');
    await waitFor(() => expect(result.current.data?.pages[0].books[0].title).toBe('Ficción'));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(new URL(fetchMock.mock.calls[1][0]).searchParams.get('q')).toBe('history');
  });

});
