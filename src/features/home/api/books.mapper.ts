import type { Book, BookPage } from "../types";
import {
  openLibraryDocSchema,
  openLibrarySearchResponseSchema,
  type OpenLibraryDocDTO,
} from "./books.dto";

export function mapBookDTOToBook(raw: unknown): Book | null {
  const result = openLibraryDocSchema.safeParse(raw);
  if (!result.success) return null;

  const doc: OpenLibraryDocDTO = result.data;
  return {
    id: doc.key,
    title: doc.title,
    authors: doc.author_name ?? [],
    firstPublishedYear: doc.first_publish_year ?? null,
    editionCount: doc.edition_count ?? 0,
  };
}

export function mapSearchResponseToBookPage(
  raw: unknown,
  offset: number,
  limit: number,
): BookPage {
  const payload = openLibrarySearchResponseSchema.parse(raw);
  const books = payload.docs.flatMap((doc) => {
    const book = mapBookDTOToBook(doc);
    return book ? [book] : [];
  });
  const nextOffset = offset + payload.docs.length;
  const total = payload.numFound ?? payload.num_found;

  return {
    books,
    nextOffset:
      payload.docs.length === 0 ||
      payload.docs.length < limit ||
      (total !== undefined && nextOffset >= total)
        ? null
        : nextOffset,
  };
}
