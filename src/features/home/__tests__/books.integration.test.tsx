import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, renderHook, screen, userEvent, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import { HttpError } from '@/services/http/httpError';
import { useBooks } from '../hooks/useBooks';
import { ComponentProvider } from '../../../../test/ComponentProvider';
import { BookPageSizeSetting } from '@/features/settings/components/BookPageSizeSetting';
import { useBookPageSize } from '@/features/settings/hooks/useBookPageSize';
import { useSettingsStore, type BookPageSize } from '@/shared/store/useSettingsStore';

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
  useSettingsStore.setState({ ...useSettingsStore.getInitialState(), bookPageSize: 100 });
  process.env.EXPO_PUBLIC_OPEN_LIBRARY_SEARCH_URL = endpoint;
  queryClient = new QueryClient({ defaultOptions: {
    queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
    mutations: { retry: false, gcTime: Infinity },
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
  it('defaults to 2000 books per page and paginates beyond that, stopping at the API total', async () => {
    useSettingsStore.setState(useSettingsStore.getInitialState());
    fetchMock.mockImplementation(async (url: string) => {
      const params = new URL(url).searchParams;
      const offset = Number(params.get('offset'));
      expect(params.get('q')).toBe('ciencia ficción');
      expect(params.get('limit')).toBe('2000');
      expect(params.get('lang')).toBe('es');
      return response(page(offset, offset === 2000 ? 10 : 2000));
    });
    const { result } = await renderHook(() => useBooks('ciencia ficción'), { wrapper: Providers });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.books[0]).toEqual({
      id: '/works/OL0W', title: 'Libro 0', authors: ['Ana Pérez'],
      firstPublishedYear: 2001, editionCount: 3,
    });
    expect(result.current.pageSize).toBe(2000);
    expect(result.current.books).toHaveLength(2000);
    await act(async () => {
      await result.current.loadNextPage();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(result.current.books).toHaveLength(2010));
    expect(result.current.books).toHaveLength(2010);
    expect(result.current.books[2009].title).toBe('Libro 2009');
    expect(result.current.nextPageStatus).toBe("complete");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => { await result.current.loadNextPage();
        // Query schedules observer notifications on the next timer tick.
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('refreshes from the first page and discards the previously loaded pages', async () => {
    fetchMock.mockResolvedValueOnce(response(page(0)))
      .mockResolvedValueOnce(response(page(100)))
      .mockResolvedValueOnce(response({ numFound: 1,
        docs: [{ key: '/works/NEW', title: 'Catálogo actualizado' }] }));
    const { result } = await renderHook(() => useBooks('fiction'), { wrapper: Providers });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.loadNextPage();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(result.current.books).toHaveLength(200));
    await act(async () => {
      await result.current.refresh();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(result.current.books[0].title)
      .toBe('Catálogo actualizado'));
    expect(result.current.books).toHaveLength(1);
    expect(result.current.nextPageStatus).toBe("complete");
    expect(new URL(fetchMock.mock.calls[2][0]).searchParams.get('offset')).toBe('0');
  });

  it('preserves loaded books after a page HTTP failure and retries the same offset', async () => {
    fetchMock.mockResolvedValueOnce(response(page(0)))
      .mockResolvedValueOnce(response({ message: 'Unavailable' }, 503, 'Service Unavailable'))
      .mockResolvedValueOnce(response(page(100, 1, 101)));
    const { result } = await renderHook(() => useBooks('fiction'), { wrapper: Providers });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.loadNextPage();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(result.current.nextPageStatus).toBe("error"));
    expect(queryClient.getQueryState(['books', 'fiction', 100])?.error).toBeInstanceOf(HttpError);
    expect(result.current.books).toHaveLength(100);
    await act(async () => { await result.current.loadNextPage(); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => {
      await result.current.retryNextPage();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(result.current.books).toHaveLength(101));
    expect(result.current.nextPageStatus).toBe("complete");
    expect(result.current.books[100].title).toBe('Libro 100');
    expect(new URL(fetchMock.mock.calls[1][0]).searchParams.get('offset')).toBe('100');
    expect(new URL(fetchMock.mock.calls[2][0]).searchParams.get('offset')).toBe('100');
  });

  it('ignores repeated pagination and retry calls while a page is in flight', async () => {
    let resolvePage!: (value: Response) => void;
    fetchMock.mockResolvedValueOnce(response(page(0)))
      .mockImplementationOnce(() => new Promise<Response>((resolve) => { resolvePage = resolve; }));
    const { result } = await renderHook(() => useBooks('fiction'), { wrapper: Providers });
    await waitFor(() => expect(result.current.books).toHaveLength(100));
    await act(async () => {
      void result.current.loadNextPage();
      void result.current.loadNextPage();
      void result.current.retryNextPage();
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].signal.aborted).toBe(false);
    await act(async () => {
      resolvePage(response(page(100)));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(result.current.books).toHaveLength(200));
  });

  it('loads the next page even when all documents on the first page were discarded', async () => {
    fetchMock.mockResolvedValueOnce(response({ numFound: 101,
      docs: Array.from({ length: 100 }, () => ({ title: 'Missing key' })) }))
      .mockResolvedValueOnce(response(page(100, 1, 101)));
    const { result } = await renderHook(() => useBooks('fiction'), { wrapper: Providers });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.books).toHaveLength(0);
    await act(async () => {
      await result.current.loadNextPage();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(result.current.books).toHaveLength(1));
    expect(result.current.books[0].title).toBe('Libro 100');
  });

  it('keeps separate cached results for each search and reuses a fresh cached search', async () => {
    fetchMock.mockResolvedValueOnce(response({ numFound: 1,
      docs: [{ key: '/works/F', title: 'Ficción' }] }))
      .mockResolvedValueOnce(response({ numFound: 1,
        docs: [{ key: '/works/H', title: 'Historia' }] }));
    const { result, rerender } = await renderHook((query: string) => useBooks(query),
      { wrapper: Providers, initialProps: 'fiction' });
    await waitFor(() => expect(result.current.books[0].title).toBe('Ficción'));
    await rerender('history');
    await waitFor(() => expect(result.current.books[0].title).toBe('Historia'));
    await rerender('fiction');
    await waitFor(() => expect(result.current.books[0].title).toBe('Ficción'));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(new URL(fetchMock.mock.calls[1][0]).searchParams.get('q')).toBe('history');
  });

  it.each([100, 200, 500, 1000, 2000] as const)(
    'restarts both list observers with %i books per page and prefetches only once', async (nextSize) => {
      const oldSize: BookPageSize = nextSize === 100 ? 200 : 100;
      useSettingsStore.setState({ bookPageSize: oldSize });
      fetchMock.mockResolvedValueOnce(response(page(0, oldSize, 5000)))
        .mockResolvedValueOnce(response(page(oldSize, oldSize, 5000)))
        .mockResolvedValueOnce(response(page(0, nextSize, 5000)))
        .mockResolvedValueOnce(response(page(nextSize, nextSize, 5000)));
      const { result } = await renderHook(() => ({
        settings: useBookPageSize(), first: useBooks('fiction'), second: useBooks('fiction'),
      }), { wrapper: Providers });
      await waitFor(() => expect(result.current.first.isLoading).toBe(false));
      await act(async () => {
        await result.current.first.loadNextPage();
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      await waitFor(() => expect(result.current.first.books).toHaveLength(oldSize * 2));
      await act(async () => { result.current.settings.changePageSize(nextSize); });
      await waitFor(() => expect(result.current.settings.isChanging).toBe(false));
      await waitFor(() => expect(result.current.first.books).toHaveLength(nextSize));
      expect(result.current.first.books).toHaveLength(nextSize);
      expect(result.current.second.books).toHaveLength(nextSize);
      expect(queryClient.getQueryData(['books', 'fiction', oldSize])).toBeUndefined();
      expect(fetchMock).toHaveBeenCalledTimes(3);
      const prefetched = new URL(fetchMock.mock.calls[2][0]).searchParams;
      expect(prefetched.get('offset')).toBe('0');
      expect(prefetched.get('limit')).toBe(String(nextSize));

      await act(async () => {
        await result.current.second.loadNextPage();
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      await waitFor(() => expect(result.current.first.books).toHaveLength(nextSize * 2));
      const nextPage = new URL(fetchMock.mock.calls[3][0]).searchParams;
      expect(nextPage.get('offset')).toBe(String(nextSize));
      expect(nextPage.get('limit')).toBe(String(nextSize));
    },
  );

  it('cancels the previous page request and ignores a late response after changing size', async () => {
    let resolveOldPage!: (value: Response) => void;
    fetchMock.mockResolvedValueOnce(response(page(0)))
      .mockImplementationOnce(() => new Promise<Response>((resolve) => { resolveOldPage = resolve; }))
      .mockResolvedValueOnce(response(page(0, 200, 5000)));
    const { result } = await renderHook(() => ({
      settings: useBookPageSize(), books: useBooks('fiction'),
    }), { wrapper: Providers });
    await waitFor(() => expect(result.current.books.isLoading).toBe(false));
    await act(async () => { void result.current.books.loadNextPage(); });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const oldSignal = fetchMock.mock.calls[1][1].signal as AbortSignal;
    await act(async () => { result.current.settings.changePageSize(200); });
    await waitFor(() => expect(result.current.books.books).toHaveLength(200));
    expect(oldSignal.aborted).toBe(true);
    await act(async () => {
      resolveOldPage(response(page(100)));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(result.current.books.books).toHaveLength(200);
    expect(result.current.books.nextPageStatus).toBe("idle");
    expect(queryClient.getQueryData(['books', 'fiction', 100])).toBeUndefined();
  });

  it('shows the default 2000 option and prefetches a changed size before a list mounts', async () => {
    useSettingsStore.setState(useSettingsStore.getInitialState());
    fetchMock.mockResolvedValueOnce(response(page(0, 1000, 5000)));
    await render(<ComponentProvider><BookPageSizeSetting /></ComponentProvider>, { wrapper: Providers });
    expect(screen.getByRole('radio', { name: '2000 libros' })).toBeChecked();
    const user = userEvent.setup();
    await user.press(screen.getByRole('radio', { name: '1000 libros' }));
    await waitFor(() => expect(screen.getByRole('radio', { name: '1000 libros' })).toBeChecked());
    await waitFor(() => expect(screen.getByRole('radio', { name: '1000 libros' })).toBeEnabled());
    const { result } = await renderHook(() => useBooks('fiction'), { wrapper: Providers });
    await waitFor(() => expect(result.current.books).toHaveLength(1000));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

});
