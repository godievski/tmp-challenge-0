export type Book = {
  id: string;
  title: string;
  authors: string[];
  firstPublishedYear: number | null;
  editionCount: number;
};

export type BookPage = {
  books: Book[];
  nextOffset: number | null;
};

export type GetBooksParams = {
  query: string;
  offset: number;
  limit: number;
  signal?: AbortSignal;
};
