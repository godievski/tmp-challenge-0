import { httpClient } from "@/services/http/httpClient";
import type { BookPage, GetBooksParams } from "../types";
import { mapSearchResponseToBookPage } from "./books.mapper";

export const booksApi = {
  async getBooks({ query, offset, limit, signal }: GetBooksParams): Promise<BookPage> {
    const endpoint = process.env.EXPO_PUBLIC_OPEN_LIBRARY_SEARCH_URL;
    if (!endpoint) {
      throw new Error("Falta configurar EXPO_PUBLIC_OPEN_LIBRARY_SEARCH_URL.");
    }

    const rawData = await httpClient.get<unknown>(endpoint, {
      signal,
      params: {
        q: query,
        fields: "key,title,author_name,first_publish_year,edition_count",
        offset,
        limit,
        lang: "es",
      },
    });

    return mapSearchResponseToBookPage(rawData, offset, limit);
  },
};
