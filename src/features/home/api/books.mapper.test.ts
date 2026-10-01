import { mapBookDTOToBook, mapSearchResponseToBookPage } from './books.mapper';

const book = { key: '/works/OL1W', title: 'El libro' };

describe('mapBookDTOToBook', () => {
  it('provides defaults when optional bibliographic fields are absent', () => {
    expect(mapBookDTOToBook(book)).toEqual({
      id: '/works/OL1W', title: 'El libro', authors: [],
      firstPublishedYear: null, editionCount: 0,
    });
  });

  it('maps authors, publication year and edition count', () => {
    expect(mapBookDTOToBook({ ...book, author_name: ['Ana'], first_publish_year: 1990,
      edition_count: 12 })).toEqual({
      id: '/works/OL1W', title: 'El libro', authors: ['Ana'],
      firstPublishedYear: 1990, editionCount: 12,
    });
  });

  it.each([null, {}, { ...book, title: '' }, { ...book, edition_count: -1 }])(
    'ignores invalid bibliographic records %j', (raw) => {
      expect(mapBookDTOToBook(raw)).toBeNull();
    },
  );
});

describe('mapSearchResponseToBookPage', () => {
  it('advances by received records even when some records cannot be displayed', () => {
    const result = mapSearchResponseToBookPage({ docs: [book, {}], numFound: 2000 }, 100, 2);
    expect(result.books).toHaveLength(1);
    expect(result.nextOffset).toBe(102);
  });

  it('continues beyond 2000 books when the catalog has more results', () => {
    const docs = Array.from({ length: 100 }, (_, index) => ({
      ...book, key: `/works/OL${index}W`,
    }));
    expect(mapSearchResponseToBookPage({ docs, numFound: 5000 }, 1900, 100).nextOffset)
      .toBe(2000);
  });

  it.each([
    { docs: [], numFound: 2000 },
    { docs: [book], numFound: 2000 },
    { docs: [book, book], numFound: 102 },
    { docs: [book, book], num_found: 102 },
  ])('stops at the end of the available results %j', (payload) => {
    expect(mapSearchResponseToBookPage(payload, 100, 2).nextOffset).toBeNull();
  });

  it('rejects a malformed search response instead of treating it as an empty list', () => {
    expect(() => mapSearchResponseToBookPage({ docs: null }, 0, 100)).toThrow();
  });
});
